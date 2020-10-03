import { CDN_URL } from "./constants"
import { OcrResult } from "./types"

export class Party {
  insignia
  name

  constructor(name: string, insignia: string) {
    this.insignia = insignia
    this.name = name
  }
}

export class Rule {
  rule

  constructor(rule: string) {
    this.rule = rule
  }
}

export class Header {
  info

  constructor(info: string) {
    this.info = info
  }
}

export class Candidate {
  img
  name

  constructor(name: string, img?: string) {
    this.img = img ? img : undefined
    this.name = name
  }
}

export type BallotStructure = [
  (Party | Rule)[],
  Header[],
  Candidate[],
  Header[],
  Candidate[]
]

export class StateBallotStructure {
  structure: BallotStructure

  constructor(ballot: OcrResult[][], path: string) {
    const url = `${CDN_URL}${path}`

    const parties: (Party | Rule)[] = ballot[0].map((ocrResult: OcrResult) => {
      if (ocrResult.logoImg) {
        return new Party(ocrResult.ocrResult, `${url}/${ocrResult.logoImg}`)
      }

      return new Rule(ocrResult.ocrResult)
    })
    const governorHeader: Header[] = ballot[1].map(
      (ocrResult: OcrResult) => new Header(ocrResult.ocrResult)
    )
    const candidatesForGorvernor: Candidate[] = ballot[2].map(
      (ocrResult: OcrResult) =>
        new Candidate(ocrResult.ocrResult, `${url}/${ocrResult.logoImg}`)
    )
    const commissionerResidentHeader: Header[] = ballot[3].map(
      (ocrResult: OcrResult) => new Header(ocrResult.ocrResult)
    )
    const candidatesForComissionerResident: Candidate[] = ballot[4].map(
      (ocrResult: OcrResult) =>
        new Candidate(ocrResult.ocrResult, `${url}/${ocrResult.logoImg}`)
    )

    this.structure = [
      parties,
      governorHeader,
      candidatesForGorvernor,
      commissionerResidentHeader,
      candidatesForComissionerResident,
    ]
  }
}

export class MunicipalBallotStructure {
  structure: BallotStructure

  constructor(ballot: OcrResult[][], path: string) {
    const url = `${CDN_URL}${path}`

    const parties: (Party | Rule)[] = ballot[0].map((ocrResult: OcrResult) => {
      if (ocrResult.logoImg) {
        return new Party(ocrResult.ocrResult, `${url}/${ocrResult.logoImg}`)
      }

      return new Rule(ocrResult.ocrResult)
    })
    const mayorHeader: Header[] = ballot[1].map(
      (ocrResult: OcrResult) => new Header(ocrResult.ocrResult)
    )
    const candidatesForMayor: Candidate[] = ballot[2].map(
      (ocrResult: OcrResult) =>
        new Candidate(ocrResult.ocrResult, `${url}/${ocrResult.logoImg}`)
    )
    const municipalLegislatorHeader: Header[] = ballot[3].map(
      (ocrResult: OcrResult) => new Header(ocrResult.ocrResult)
    )

    const municipalLegislators = ballot.slice(4)
    const candidatesForMunicipalLegislator: Candidate[][] = municipalLegislators.map(
      (ocrResult: OcrResult[]) =>
        ocrResult.map((result: OcrResult) => new Candidate(result.ocrResult))
    )

    console.log(candidatesForMunicipalLegislator)

    this.structure = [
      parties,
      mayorHeader,
      candidatesForMayor,
      municipalLegislatorHeader,
      ...candidatesForMunicipalLegislator,
    ]
  }
}
