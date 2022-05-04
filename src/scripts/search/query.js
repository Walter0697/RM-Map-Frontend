const STATEMENT = 'STATEMENT'
const COLLECTION = 'COLLECTION'
const NESTED = 'NESTED'
const SELECT = 'SELECT'
const WHERE = 'WHERE'
const JOIN = 'JOIN'
const AND = 'AND'
const OR = 'OR'
const OPERATOR = 'OPERATOR'
const VAR = 'VAR'
const FIELD = 'FIELD'
const UNKNOWN = 'UNKNOWN'

const MARKERS = 'markers'
const HIDDEN = 'hidden'
const operator_list = ['=', '<', '>', '>=', '<=', '!=']
const keyword_list = [SELECT, WHERE, AND, OR, MARKERS, HIDDEN]
const field_list = ['eventtype', 'permanent', 'need_booking', 'price', 'status', 'is_fav']

const checkBlockType = (str) => {
	if (str.toUpperCase() === SELECT) {
		return SELECT
	} else if (str.toUpperCase() === WHERE) {
		return WHERE
	} else if (str.toUpperCase() === JOIN) {
		return JOIN
	} else if (str.toUpperCase() === AND) {
		return AND 
	} else if (str.toUpperCase() === OR) {
		return OR
	} else if (operator_list.includes(str)) {
		return OPERATOR
	} else if (field_list.includes(str.toLowerCase())) {
		return FIELD
	} else if (str.toLowerCase() === MARKERS) {
		return COLLECTION
	} else if (str.toLowerCase() === HIDDEN) {
		return COLLECTION
	}
	return VAR
}

const splitStringToBlock = (str) => {
	let input = str.trim()
    let output = []

    let currentStr = ''
    let depth = 0

    for (let i = 0; i < input.length; i++) {
        const character = input.charAt(i)
        if (character === '(') {
            depth++
        } else if (character === ')') {
            if (depth === 0) {
                return {
                    error: 'expected ( before )',
                    list: [ {
                        type: UNKNOWN,
					}],
                }
            }
            depth--
            if (depth === 0) {
                if (currentStr) {
                    output.push({
                        type: NESTED,
                        value: currentStr,
                    })
                }
                currentStr = '' 
            }
        } else {
            if (depth === 0) {
                if (character === ' ') {
                    if (currentStr) {
                        const block_type = checkBlockType(currentStr)
                        output.push({
                            type: block_type,
                            value: currentStr,
                        })
                    }
                    currentStr = ''
                } else {
                    currentStr += character
                }
            } else {
                currentStr += character
            }
        }
    }

	if (depth !== 0) {
		return {
			error: 'expected ) after (',
			list: [],
		}
	}

    if (currentStr) {
        const block_type = checkBlockType(currentStr)
		output.push({
			type: block_type,
			value: currentStr,
		})
    }

    return {
        error: null,
        list: output,
    }
}

const analysisQuery = (block_list) => {
	for (let i = 0; i < block_list.length; i++) {
		if (block_list[i].type === UNKNOWN) {
			return {
				type: UNKNOWN,
				value: block_list[i].value,
			}
		}
	}
	if (block_list.length === 0) {
		return {
			type: UNKNOWN,
			value: 'empty list',
		}
	} else if (block_list.length === 1) {
		const first = block_list[0]
		if (first.type === NESTED) {
			const currentQuery = splitStringToBlock(first.value)
			if (currentQuery.error) {
				return {
					type: UNKNOWN,
					value: currentQuery.error,
				}
			}
			return analysisQuery(currentQuery.list)
		} else {
			return block_list	// return the original item if it is neither nested or unknown
		}
	} else if (block_list.length === 2) {
		return {
			type: UNKNOWN,
			value: 'unexpected syntax',
		}
	} else if (block_list.length === 3) {
		let first = block_list[0]
		let last = block_list[2]
		const mid = block_list[1]
		if (first.type === NESTED) {
			const currentQuery = splitStringToBlock(first.value)
			if (currentQuery.error) {
				return {
					type: UNKNOWN,
					value: currentQuery.error,
				}
			}
			first = analysisQuery(currentQuery.list)
			if (first.type === UNKNOWN) {
				return {
					type: UNKNOWN,
					value: first.value,
				}
			}
		}
		if (last.type === NESTED) {
			const currentQuery = splitStringToBlock(last.value)
			if (currentQuery.error) {
				return {
					type: UNKNOWN,
					value: currentQuery.error,
				}
			}
			last = analysisQuery(currentQuery.list)
			if (last.type === UNKNOWN) {
				return {
					type: UNKNOWN,
					value: last.value,
				}
			}
		}

		if (mid.type === JOIN) {
			if (first.type === COLLECTION && last.type === COLLECTION) {
				return {
					type: COLLECTION,
					value: `${first.value} ${JOIN} ${last.value}`,
				}
			}
		} else if (mid.type === AND || mid.type === OR) {
			if (first.type === STATEMENT && last.type === STATEMENT) {
				return {
					type: STATEMENT,
					value: `${first.value} ${mid.value} ${last.value}`,
				}
			}
		} else if (mid.type === OPERATOR) {
			if (first.type === FIELD && last.type === VAR) {
				return {
					type: STATEMENT,
					value: `${first.value} ${mid.value} ${last.value}`,
				}
			}
		}
		return {
			type: UNKNOWN,
			value: `${first.value} ${mid.value} ${last.value}`,
		}
	} else {
		// in this case, it should have 3 or more blocks
		let first = block_list[0]
		let second = block_list[1]
		let third = block_list[2]
		if (first.type === SELECT && third.type === WHERE) {
			if (second.type === NESTED) {
				const currentQuery = splitStringToBlock(second.value)
				if (currentQuery.error) {
					return {
						type: UNKNOWN,
						value: currentQuery.error,
					}
				}
				second = analysisQuery(currentQuery.list)
				if (second.type === UNKNOWN) {
					return {
						type: UNKNOWN,
						value: second.value,
					}
				}
			}

			if (second.type === COLLECTION) {
				const rest = block_list.slice(3)
				const last = analysisQuery(rest)
				if (last.type === STATEMENT) {
					return {
						type: COLLECTION,
						value: `${first.value} ${second.value} ${third.value} ${last.value}`
					}
				} else {
					return {
						type: UNKNOWN,
						value: last.value,
					}
				}
				
			}
		} else if (first.type === FIELD && second.type === OPERATOR && third.type === VAR) {
			if (block_list.length >= 4) {
				const fourth = block_list[3]
				if (fourth.type === AND || fourth.type === OR) {
					const rest = block_list.slice(4)
					const last = analysisQuery(rest)
					if (last.type === STATEMENT) {
						return {
							type: STATEMENT,
							value: `${first.value} ${second.value} ${third.value} ${fourth.value} ${last.value}`
						}
					} else {
						return {
							type: UNKNOWN,
							value: last.value,
						}
					}
				} else {
					return {
						type: UNKNOWN,
						value: fourth.value,
					}
				}
			} else {
				return {
					type: UNKNOWN,
					value: block_list[0].value
				}
			}
		} else if (first.type === NESTED && (second.type === AND || second.type === OR)) {
			const currentQuery = splitStringToBlock(first.value)
			if (currentQuery.error) {
				return {
					type: UNKNOWN,
					value: currentQuery.error,
				}
			}
			const finalFirst = analysisQuery(currentQuery.list)
			if (finalFirst.type === STATEMENT) {
				const rest = block_list.slice(2)
				const last = analysisQuery(rest)
					if (last.type === STATEMENT) {
						return {
							type: STATEMENT,
							value: `${finalFirst.value} ${second.value} ${last.value}`
						}
					} else {
						return {
							type: UNKNOWN,
							value: last.value,
						}
					}
			} else {
				return {
					type: UNKNOWN,
					value: finalFirst.value,
				}
			}
		}
		else {
			return {
				type: UNKNOWN,
				value: block_list[0].value
			}
		}
	}
}

const generateInitialBlock = (input_str) => {
	return [{
		type: NESTED,
		value: input_str,
	}]
}

const validateQuery = (input_str) => {
    const init_block = generateInitialBlock(input_str)
    const result = analysisQuery(init_block)
    if (result.type === UNKNOWN) {
        return {
            error: 'incorrect syntax',
        }
    } else if (result.type === COLLECTION) {
        return {
            error: null,
        }
    } else {
        return {
            error: `expected ${COLLECTION} but recieved ${result.type}`,
        }
    }
}

const parseQuery = (markers, str) => {

}

const querys = {
    keyword_list,
    field_list,
    validate: validateQuery,
    parse: parseQuery,
}

export default querys