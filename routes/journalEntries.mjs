import express from 'express'
import { createJournalTransaction, getAllJournalEntries, getCurrentJournalEntries, getAllEntriesByAccount } from '../controllers/journalEntries.mjs'
const router = express.Router()

router.get('/all-entries', getAllJournalEntries)
router.get('/current-entries', getCurrentJournalEntries)
router.post('/get-all-entries-by-account', getAllEntriesByAccount)

router.post('/create-transaction', createJournalTransaction)


export default router