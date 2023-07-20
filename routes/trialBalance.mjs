import express from 'express'
import { getTrialBalance } from '../controllers/trialBalance.mjs'
const router = express.Router()

router.get('/', getTrialBalance)

export default router