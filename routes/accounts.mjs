import express from 'express'

import { createAccount, getAccounts, getActiveAccounts } from '../controllers/accounts.mjs'

const router = express.Router()

router.post('/createAccount', createAccount)

router.get('/getAccounts', getAccounts)
router.get('/getActiveAccounts', getActiveAccounts)

export default router