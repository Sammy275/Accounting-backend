import express from 'express'
import { generateOwnerEquityStatement } from '../controllers/ownerEquityStatement.mjs'
const router = express.Router()

router.get('/', generateOwnerEquityStatement)

export default router