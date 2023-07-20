import express from 'express'

import { generateBalanceSheet } from '../controllers/balanceSheet.mjs'

const router = express.Router()

router.get('/', generateBalanceSheet)

export default router