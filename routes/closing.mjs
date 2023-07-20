import express from 'express'
import { closeJournalEntries } from '../controllers/closing.mjs'

const router = express.Router()

router.post('/close-journal-entries', closeJournalEntries)

export default router