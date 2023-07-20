import express from 'express'
import { generateIncomeStatement } from '../controllers/incomeStatement.mjs'
const router = express.Router()

router.get('/', generateIncomeStatement)

export default router