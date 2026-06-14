import { describe, it, expect } from 'vitest'
import { calculateRecommendations } from './scoring.js'

const mockPrograms = [
  {
    code: 'DSU-BSIT-001',
    name: 'BS Information Technology',
    faculty: 'FaCET',
    compatible_strands: ['STEM'],
    alternative_strands: ['GAS', 'TVL'],
    incompatible_strands: ['ABM', 'HUMSS'],
    weighted_subjects: { math: 0.3, science: 0.2, english: 0.3, filipino: 0.2 },
    suast_subtest_weights: { general_ability: 0.2, numerical_aptitude: 0.3, verbal_aptitude: 0.15, spatial_aptitude: 0.2, perceptual_aptitude: 0.1, manual_dexterity: 0.05 },
    holland_codes: ['Investigative', 'Conventional'],
    holland_code_weights: { I: 0.5, C: 0.25, R: 0.25 },
    required_skills: { analytical: 5, technical: 5, creative: 3, social: 2, leadership: 2, organizational: 3 },
    career_clusters: ['tech'],
    career_paths: ['Software Developer'],
    is_board_program: false,
  },
  {
    code: 'DSU-BSBA-019',
    name: 'BS Business Administration',
    faculty: 'Faculty of Business and Management',
    compatible_strands: ['ABM'],
    alternative_strands: ['GAS'],
    incompatible_strands: ['STEM', 'HUMSS'],
    weighted_subjects: { math: 0.3, science: 0.1, english: 0.35, filipino: 0.25 },
    suast_subtest_weights: { general_ability: 0.15, numerical_aptitude: 0.25, verbal_aptitude: 0.25, spatial_aptitude: 0.05, perceptual_aptitude: 0.2, manual_dexterity: 0.1 },
    holland_codes: ['Enterprising', 'Conventional'],
    holland_code_weights: { E: 0.5, C: 0.3, S: 0.2 },
    required_skills: { analytical: 4, technical: 2, creative: 3, social: 4, leadership: 5, organizational: 4 },
    career_clusters: ['business'],
    career_paths: ['Business Manager'],
    is_board_program: false,
  },
]

describe('calculateRecommendations', () => {
  it('returns top recommendations sorted by score descending', () => {
    const studentData = {
      strand: 'STEM',
      grades: { math: 90, science: 85, english: 88, filipino: 80 },
      strandSpecificGrades: {},
      gwa: 88,
      suastTiers: { overall: 'high', general_ability: 'high', numerical_aptitude: 'moderate', verbal_aptitude: 'high', spatial_aptitude: 'moderate', perceptual_aptitude: 'moderate', manual_dexterity: 'moderate' },
      hollandCode: { code: 'IRC', scores: { I: 4, R: 3, C: 2, A: 1, S: 1, E: 1 }, top3: ['I', 'R', 'C'] },
      interests: { tech: 4 },
      skills: { analytical: 4, technical: 4, creative: 3, social: 2, leadership: 2, organizational: 3 },
    }

    const results = calculateRecommendations(studentData, mockPrograms)
    expect(results).toHaveLength(2)
    expect(results[0].rank).toBe(1)
    expect(results[1].rank).toBe(2)
    expect(results[0].totalScore).toBeGreaterThanOrEqual(results[1].totalScore)
  })

  it('returns empty array for empty programs', () => {
    const results = calculateRecommendations({ strand: 'STEM', grades: {}, strandSpecificGrades: {}, gwa: 0, suastTiers: {}, hollandCode: null, interests: {}, skills: {} }, [])
    expect(results).toEqual([])
  })

  it('filters out inactive programs when activePrograms is provided', () => {
    const studentData = {
      strand: 'STEM',
      grades: { math: 90, science: 85, english: 88, filipino: 80 },
      strandSpecificGrades: {},
      gwa: 88,
      suastTiers: { overall: 'high' },
      hollandCode: null,
      interests: {},
      skills: {},
    }

    const results = calculateRecommendations(studentData, mockPrograms, {
      activePrograms: { 'DSU-BSIT-001': true, 'DSU-BSBA-019': false },
    })
    expect(results).toHaveLength(1)
    expect(results[0].program.code).toBe('DSU-BSIT-001')
  })

  it('filters out programs with total score of 0', () => {
    const studentData = {
      strand: '',
      grades: {},
      strandSpecificGrades: {},
      gwa: 0,
      suastTiers: {},
      hollandCode: null,
      interests: {},
      skills: {},
    }

    const results = calculateRecommendations(studentData, mockPrograms)
    expect(results.every(r => r.totalScore > 0)).toBe(true)
  })

  it('returns correct score breakdown shape', () => {
    const studentData = {
      strand: 'ABM',
      grades: { math: 85, science: 80, english: 90, filipino: 88 },
      strandSpecificGrades: {},
      gwa: 86,
      suastTiers: { overall: 'moderate', general_ability: 'moderate', numerical_aptitude: 'low', verbal_aptitude: 'high', spatial_aptitude: 'moderate', perceptual_aptitude: 'moderate', manual_dexterity: 'low' },
      hollandCode: { code: 'ESC', scores: { E: 4, S: 3, C: 3, R: 1, I: 1, A: 1 }, top3: ['E', 'S', 'C'] },
      interests: { business: 5 },
      skills: { analytical: 3, technical: 2, creative: 3, social: 4, leadership: 5, organizational: 4 },
    }

    const results = calculateRecommendations(studentData, mockPrograms)
    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(r).toHaveProperty('program')
      expect(r).toHaveProperty('totalScore')
      expect(r).toHaveProperty('breakdown')
      expect(r).toHaveProperty('admission')
      expect(r).toHaveProperty('rank')
      expect(r.breakdown).toHaveProperty('academic')
      expect(r.breakdown).toHaveProperty('suast')
      expect(r.breakdown).toHaveProperty('personalFit')
      expect(r.admission).toHaveProperty('label')
      expect(r.admission).toHaveProperty('color')
      expect(r.admission).toHaveProperty('value')
      expect(r.totalScore).toBeGreaterThanOrEqual(0)
      expect(r.totalScore).toBeLessThanOrEqual(100)
    }
  })

  it('ranks ABM student higher in business than STEM student', () => {
    const stemStudent = {
      strand: 'STEM',
      grades: { math: 90, science: 90, english: 85, filipino: 80 },
      strandSpecificGrades: {},
      gwa: 88,
      suastTiers: { overall: 'high' },
      hollandCode: null,
      interests: {},
      skills: {},
    }
    const abmStudent = {
      strand: 'ABM',
      grades: { math: 85, science: 80, english: 90, filipino: 88 },
      strandSpecificGrades: {},
      gwa: 87,
      suastTiers: { overall: 'moderate' },
      hollandCode: null,
      interests: {},
      skills: {},
    }

    const stemResults = calculateRecommendations(stemStudent, mockPrograms)
    const abmResults = calculateRecommendations(abmStudent, mockPrograms)

    const stemBaScore = stemResults.find(r => r.program.code === 'DSU-BSBA-019')?.totalScore || 0
    const abmBaScore = abmResults.find(r => r.program.code === 'DSU-BSBA-019')?.totalScore || 0
    expect(abmBaScore).toBeGreaterThan(stemBaScore)
  })

  it('handles missing optional data gracefully', () => {
    const studentData = {
      strand: 'STEM',
      grades: {},
      strandSpecificGrades: {},
      gwa: 0,
      suastTiers: {},
      hollandCode: null,
      interests: {},
      skills: {},
    }

    const results = calculateRecommendations(studentData, mockPrograms)
    expect(Array.isArray(results)).toBe(true)
    for (const r of results) {
      expect(typeof r.totalScore).toBe('number')
      expect(Number.isFinite(r.totalScore)).toBe(true)
    }
  })
})
