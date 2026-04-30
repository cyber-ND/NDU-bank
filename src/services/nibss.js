const axios = require('axios');

let nibssToken = null;
let tokenExpiry = null;

async function getNibssToken() {
    if (nibssToken && Date.now() < tokenExpiry - 60000) {
        return nibssToken;
    }

    const res = await axios.post(`${process.env.NIBSS_BASE_URL}/api/auth/token`, {
        apiKey: process.env.NIBSS_API_KEY,
        apiSecret: process.env.NIBSS_API_SECRET,
    });

    nibssToken = res.data.token;
    tokenExpiry = Date.now() + 3600 * 1000;
    return nibssToken;
}

function authHeaders() {
    return { Authorization: `Bearer ${nibssToken}` };
}

async function validateKyc(kycType, kycID) {
    await getNibssToken();
    const endpoint = kycType === 'bvn' ? '/api/validateBvn' : '/api/validateNin';
    const body = kycType === 'bvn' ? { bvn: kycID } : { nin: kycID };
    const res = await axios.post(
        `${process.env.NIBSS_BASE_URL}${endpoint}`,
        body,
        { headers: authHeaders() }
    );
    return {
        valid: res.data.success,
        ...res.data.data,
    };
}

async function createNibssAccount(kycType, kycID, dob) {
    await getNibssToken();
    const res = await axios.post(
        `${process.env.NIBSS_BASE_URL}/api/account/create`,
        { kycType, kycID, dob },
        { headers: authHeaders() }
    );
    return res.data.account;
}

async function nameEnquiry(accountNumber) {
    await getNibssToken();
    const res = await axios.get(
        `${process.env.NIBSS_BASE_URL}/api/account/name-enquiry/${accountNumber}`,
        { headers: authHeaders() }
    );
    // console.log('nameEnquiry response:', JSON.stringify(res.data));
    return res.data;
}

async function transfer(from, to, amount) {
    await getNibssToken();
    
    // check recipient balance before transfer
    const balanceBefore = await axios.get(
        `${process.env.NIBSS_BASE_URL}/api/account/balance/${to}`,
        { headers: authHeaders() }
    );
    const balanceBeforeAmount = balanceBefore.data.balance;

    try {
        const res = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/transfer`,
            { from, to, amount: String(amount) },
            { headers: authHeaders() }
        );
        return res.data;
    } catch (err) {
        if (err.response?.status === 500) {
            // verify transfer actually happened by checking recipient balance
            const balanceAfter = await axios.get(
                `${process.env.NIBSS_BASE_URL}/api/account/balance/${to}`,
                { headers: authHeaders() }
            );
            const balanceAfterAmount = balanceAfter.data.balance;

            // console.log('Balance before:', balanceBeforeAmount, 'Balance after:', balanceAfterAmount);

            if (balanceAfterAmount > balanceBeforeAmount) {
                // transfer actually succeeded
                return {
                    reference: `TX${Date.now()}`,
                    status: 'SUCCESS',
                    amount,
                    from,
                    to,
                };
            } else {
                // transfer truly failed
                throw new Error('Transfer failed — recipient balance unchanged');
            }
        }
        throw err;
    }
}

async function getTransactionStatus(transactionId) {
    await getNibssToken();
    const res = await axios.get(
        `${process.env.NIBSS_BASE_URL}/api/transaction/${transactionId}`,
        { headers: authHeaders() }
    );
    // console.log('getTransactionStatus response:', JSON.stringify(res.data));
    return res.data.data;
}

module.exports = {
    validateKyc,
    createNibssAccount,
    nameEnquiry,
    transfer,
    getTransactionStatus,
};