import {
  BallotType,
  LegislativeBallot,
  MunicipalBallot,
  Selection,
  StateBallot,
} from "../../../ballot-validator/types"
import { VotesCoordinates } from "../../generate-ballot/types/ballot-machine"
import { BallotConfigs } from "./ballot-configs"

type MarkAsSelectedArgs = {
  votes: Selection[]
  position: number
}

function markAsSelected({ votes, position }: MarkAsSelectedArgs) {
  return [
    ...votes.slice(0, position),
    Selection.selected,
    ...votes.slice(position + 1),
  ]
}

function transformStateVotes(
  votes: VotesCoordinates[],
  cols: number
): StateBallot {
  const parties = new Array(cols).fill(Selection.notSelected)
  const governor = new Array(cols).fill(Selection.notSelected)
  const residentCommissioner = Array(cols).fill(Selection.notSelected)
  const initialValue: StateBallot = {
    parties,
    governor,
    residentCommissioner,
  }

  return votes.reduce((prev, curr): StateBallot => {
    if (curr.row === 0) {
      return {
        ...prev,
        parties: markAsSelected({
          votes: prev.parties,
          position: curr.column,
        }),
      }
    } else if (curr.row === 2) {
      return {
        ...prev,
        governor: markAsSelected({
          votes: prev.governor,
          position: curr.column,
        }),
      }
    } else if (curr.row === 4) {
      return {
        ...prev,
        residentCommissioner: markAsSelected({
          votes: prev.residentCommissioner,
          position: curr.column,
        }),
      }
    }

    return prev
  }, initialValue)
}

function transformMunicipalVotes(
  votes: VotesCoordinates[],
  cols: number,
  legislators: number
): MunicipalBallot {
  const parties = new Array(cols).fill(Selection.notSelected)
  const mayor = new Array(cols).fill(Selection.notSelected)
  const municipalLegislator = new Array(legislators).fill(null)

  municipalLegislator.forEach((_, index) => {
    municipalLegislator[index] = new Array(cols).fill(Selection.notSelected)
  })

  const initialValue: MunicipalBallot = {
    parties,
    mayor,
    municipalLegislator,
  }

  return votes.reduce((prev, curr): MunicipalBallot => {
    if (curr.row === 0) {
      return {
        ...prev,
        parties: markAsSelected({
          votes: prev.parties,
          position: curr.column,
        }),
      }
    } else if (curr.row === 2) {
      return {
        ...prev,
        mayor: markAsSelected({
          votes: prev.mayor,
          position: curr.column,
        }),
      }
    }

    // Municipal legislators come after row 3.
    // If my coordinate is on row 4 I have to subtract 4 - (3 + 1) to target the first row of the municipal legislator array.
    return {
      ...prev,
      municipalLegislator: prev.municipalLegislator.map((row, index) => {
        if (curr.row - 4 === index) {
          return markAsSelected({
            votes: row,
            position: curr.column,
          })
        }

        return row
      }),
    }
  }, initialValue)
}

function transformLegislativeVotes(
  votes: VotesCoordinates[],
  cols: number
): LegislativeBallot {
  // TODO: The columns in a municipal ballot can change depending on the town.
  const parties = new Array(cols).fill(Selection.notSelected)
  const mayor = new Array(cols).fill(Selection.notSelected)
  // TODO: We need to specify the amount of municipal legislators that a town can select.
  const municipalLegislator = new Array(5).fill(null)

  municipalLegislator.forEach((_, index) => {
    municipalLegislator[index] = new Array(cols).fill(Selection.notSelected)
  })

  const initialValue: LegislativeBallot = {
    parties,
    mayor,
    municipalLegislator,
  }

  return votes.reduce((prev, curr): LegislativeBallot => {
    if (curr.row === 0) {
      return {
        ...prev,
        parties: markAsSelected({
          votes: prev.parties,
          position: curr.column,
        }),
      }
    } else if (curr.row === 2) {
      return {
        ...prev,
        mayor: markAsSelected({
          votes: prev.mayor,
          position: curr.column,
        }),
      }
    }

    // Municipal legislators come after row 3.
    // If my coordinate is on row 4 I have to subtract 4 - (3 + 1) to target the first row of the municipal legislator array.
    return {
      ...prev,
      municipalLegislator: prev.municipalLegislator.map(row => {
        if (curr.row - 4) {
          return markAsSelected({
            votes: row,
            position: curr.column,
          })
        }

        return row
      }),
    }
  }, initialValue)
}

export default function coordinatesToSections(
  votes: VotesCoordinates[],
  ballot: BallotConfigs,
  ballotType: BallotType
) {
  switch (ballotType) {
    case BallotType.state:
      return transformStateVotes(votes, ballot.cols)

    case BallotType.municipality:
      return transformMunicipalVotes(votes, ballot.cols, ballot.legislators)

    default:
      return transformLegislativeVotes(votes, ballot.cols)
  }
}
