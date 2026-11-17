const mongoose = require('mongoose');

const SuspiciousIndicatorSchema = new mongoose.Schema({
  type:   { type: String },
  reason: { type: String }
}, { _id: false });

const URLHistorySchema = new mongoose.Schema({
  originalUrl: { type: String, required: true, trim: true },

  /* ── Structural checks ─────────────────────────── */
  regexResult: {
    isValid:        Boolean,
    matchedPattern: String,
    details:        String
  },
  dfaResult: {
    isAccepted:         Boolean,
    finalState:         String,
    transitionHistory:  [String],
    details:            String
  },

  /* ── Security classification ───────────────────── */
  // securityStatus: "NO_SUSPICIOUS_PATTERN" | "SUSPICIOUS" | "INVALID"
  securityStatus: {
    type:    String,
    enum:    ['NO_SUSPICIOUS_PATTERN', 'SUSPICIOUS', 'INVALID'],
    default: 'INVALID'
  },
  suspiciousIndicators: [SuspiciousIndicatorSchema],

  /* ── Legacy / convenience fields (kept for backward compat) ── */
  isValid:    { type: Boolean, default: false },
  finalState: { type: String, enum: ['valid', 'invalid', 'suspicious'], default: 'invalid' },
  riskLevel:  { type: String, enum: ['safe', 'low', 'medium', 'high'], default: 'high' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('URLHistory', URLHistorySchema);
