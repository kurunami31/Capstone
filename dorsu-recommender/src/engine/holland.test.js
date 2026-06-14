import { describe, it, expect } from 'vitest'
import { calculateHollandCode, hollandMatchScore } from './holland.js'

describe('calculateHollandCode', () => {
  it('returns correct top-3 codes sorted by score descending', () => {
    const answers = { Realistic: 3, Investigative: 5, Artistic: 2, Social: 4, Enterprising: 1, Conventional: 0 }
    const result = calculateHollandCode(answers)
    expect(result.code).toBe('ISR')
    expect(result.top3).toEqual(['I', 'S', 'R'])
  })

  it('returns all six scores', () => {
    const answers = { Realistic: 1, Investigative: 2, Artistic: 3, Social: 4, Enterprising: 5, Conventional: 6 }
    const result = calculateHollandCode(answers)
    expect(result.scores).toEqual({ R: 1, I: 2, A: 3, S: 4, E: 5, C: 6 })
  })

  it('handles empty answers object', () => {
    const result = calculateHollandCode({})
    expect(result.code).toBe('RIA')
    expect(result.scores).toEqual({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
  })

  it('handles ties by alphabetical order (first sorted wins)', () => {
    const answers = { Realistic: 5, Investigative: 5, Artistic: 5, Social: 4, Enterprising: 3, Conventional: 2 }
    const result = calculateHollandCode(answers)
    expect(result.top3).toHaveLength(3)
    expect(result.scores.R).toBe(5)
    expect(result.scores.I).toBe(5)
    expect(result.scores.A).toBe(5)
  })

  it('handles partial answers', () => {
    const answers = { Realistic: 4, Investigative: 3 }
    const result = calculateHollandCode(answers)
    expect(result.scores.R).toBe(4)
    expect(result.scores.I).toBe(3)
    expect(result.scores.A).toBe(0)
    expect(result.scores.S).toBe(0)
    expect(result.scores.E).toBe(0)
    expect(result.scores.C).toBe(0)
  })
})

describe('hollandMatchScore', () => {
  it('returns higher score for better match', () => {
    const studentCode = { code: 'IRC', scores: { I: 5, R: 4, C: 3, A: 0, S: 0, E: 0 }, top3: ['I', 'R', 'C'] }
    const score = hollandMatchScore(studentCode, ['Investigative', 'Realistic', 'Conventional'], { I: 0.5, R: 0.3, C: 0.2 })
    expect(score).toBe(77)
  })

  it('returns a score between 0 and 100', () => {
    const studentCode = { code: 'ASE', scores: { A: 4, S: 3, E: 2, R: 0, I: 0, C: 0 }, top3: ['A', 'S', 'E'] }
    const score = hollandMatchScore(studentCode, ['Investigative', 'Conventional'], { I: 0.6, C: 0.4 })
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns 0 for complete mismatch', () => {
    const studentCode = { code: 'ASE', scores: { A: 4, S: 3, E: 2, R: 0, I: 0, C: 0 }, top3: ['A', 'S', 'E'] }
    const score = hollandMatchScore(studentCode, ['Realistic'], { R: 1.0 })
    expect(score).toBe(0)
  })

  it('handles empty program codes', () => {
    const studentCode = { code: 'IRC', scores: { I: 5, R: 4, C: 3, A: 0, S: 0, E: 0 }, top3: ['I', 'R', 'C'] }
    const score = hollandMatchScore(studentCode, [], {})
    expect(score).toBe(0)
  })
})
