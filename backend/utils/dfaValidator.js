/**
 * DFA-based URL Validator
 * Subject: 22ITT53 - Formal Languages and Automata Theory
 *
 * States:
 *   q0  - Start state
 *   q1  - Read 'h'
 *   q2  - Read 'ht'
 *   q3  - Read 'htt'
 *   q4  - Read 'http'
 *   q4s - Read 'https'
 *   q5  - Read 'http:' or 'https:'
 *   q6  - Read first slash
 *   q7  - Read '//' (protocol separator complete)
 *   q8  - Reading domain characters
 *   q9  - Read a dot in domain
 *   q10 - Reading TLD characters (ACCEPTING STATE)
 *   q11 - Reading path/query/fragment (ACCEPTING STATE)
 *   qDEAD - Dead/reject state
 */

const STATES = {
  q0: 'q0 (Start)',
  q1: 'q1 (Read h)',
  q2: 'q2 (Read ht)',
  q3: 'q3 (Read htt)',
  q4: 'q4 (Read http)',
  q4s: 'q4s (Read https)',
  q5: 'q5 (Read protocol colon)',
  q6: 'q6 (Read first slash)',
  q7: 'q7 (Protocol complete - Read //)',
  q8: 'q8 (Reading domain)',
  q9: 'q9 (Read dot in domain)',
  q10: 'q10 (Reading TLD - Accepting)',
  q11: 'q11 (Reading path/query - Accepting)',
  qDEAD: 'qDEAD (Dead State)'
};

const ACCEPTING_STATES = new Set(['q10', 'q11']);
const START_STATE = 'q0';

function classifyChar(ch) {
  if (/[a-zA-Z]/.test(ch)) return 'LETTER';
  if (/[0-9]/.test(ch)) return 'DIGIT';
  const map = { '.': 'DOT', ':': 'COLON', '/': 'SLASH', '-': 'HYPHEN', '_': 'UNDERSCORE', '?': 'QUESTION', '#': 'HASH', '@': 'AT', '=': 'EQUAL', '&': 'AMPERSAND', '%': 'PERCENT', '+': 'PLUS' };
  return map[ch] || 'OTHER';
}

function transition(state, ch) {
  const type = classifyChar(ch);
  switch (state) {
    case 'q0': return (ch === 'h' || ch === 'H') ? 'q1' : 'qDEAD';
    case 'q1': return (ch === 't' || ch === 'T') ? 'q2' : 'qDEAD';
    case 'q2': return (ch === 't' || ch === 'T') ? 'q3' : 'qDEAD';
    case 'q3': return (ch === 'p' || ch === 'P') ? 'q4' : 'qDEAD';
    case 'q4':
      if (ch === ':') return 'q5';
      if (ch === 's' || ch === 'S') return 'q4s';
      return 'qDEAD';
    case 'q4s': return (ch === ':') ? 'q5' : 'qDEAD';
    case 'q5': return (ch === '/') ? 'q6' : 'qDEAD';
    case 'q6': return (ch === '/') ? 'q7' : 'qDEAD';
    case 'q7': return (type === 'LETTER' || type === 'DIGIT') ? 'q8' : 'qDEAD';
    case 'q8':
      if (type === 'LETTER' || type === 'DIGIT' || type === 'HYPHEN' || type === 'UNDERSCORE') return 'q8';
      if (type === 'DOT') return 'q9';
      if (type === 'AT') return 'q8';
      return 'qDEAD';
    case 'q9': return (type === 'LETTER' || type === 'DIGIT') ? 'q10' : 'qDEAD';
    case 'q10':
      if (type === 'LETTER' || type === 'DIGIT' || type === 'HYPHEN') return 'q10';
      if (type === 'DOT') return 'q9';
      if (type === 'SLASH' || type === 'COLON' || type === 'QUESTION' || type === 'HASH') return 'q11';
      if (type === 'AT') return 'q8';
      return 'qDEAD';
    case 'q11':
      if (type === 'OTHER') return 'qDEAD';
      return 'q11';
    case 'qDEAD': return 'qDEAD';
    default: return 'qDEAD';
  }
}

function validateWithDFA(url) {
  let currentState = START_STATE;
  const transitionHistory = ['Start: ' + STATES[currentState]];

  for (let i = 0; i < url.length; i++) {
    const ch = url[i];
    const nextState = transition(currentState, ch);
    transitionHistory.push("Read '" + ch + "' (" + classifyChar(ch) + ") -> " + (STATES[nextState] || nextState));
    currentState = nextState;
    if (currentState === 'qDEAD') {
      transitionHistory.push('Dead state reached at position ' + i + '. Remaining input ignored.');
      break;
    }
  }

  const isAccepted = ACCEPTING_STATES.has(currentState);
  return {
    isAccepted,
    finalState: currentState,
    finalStateDescription: STATES[currentState] || currentState,
    transitionHistory,
    details: isAccepted
      ? 'DFA accepted the URL. Final state ' + currentState + ' is an accepting state.'
      : 'DFA rejected the URL. Final state ' + currentState + ' is not an accepting state.',
    acceptingStates: Array.from(ACCEPTING_STATES),
    startState: START_STATE,
    stateDescriptions: STATES
  };
}

function getDFADefinition() {
  const states = Object.keys(STATES);
  const alphabet = ['LETTER', 'DIGIT', 'DOT', 'COLON', 'SLASH', 'HYPHEN', 'UNDERSCORE', 'QUESTION', 'HASH', 'AT', 'OTHER'];
  const charSamples = { LETTER: 'a', DIGIT: '1', DOT: '.', COLON: ':', SLASH: '/', HYPHEN: '-', UNDERSCORE: '_', QUESTION: '?', HASH: '#', AT: '@', OTHER: ' ' };
  const table = {};
  for (const state of states) {
    table[state] = {};
    for (const sym of alphabet) {
      table[state][sym] = transition(state, charSamples[sym]);
    }
  }
  return {
    states,
    alphabet,
    startState: START_STATE,
    acceptingStates: Array.from(ACCEPTING_STATES),
    deadState: 'qDEAD',
    stateDescriptions: STATES,
    transitionTable: table
  };
}

module.exports = { validateWithDFA, getDFADefinition };
