const QUERY = 'QUERY'
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
const operator_list = ['=', '<', '>', '>=', '<=', '!=']
const keyword_list = [SELECT, WHERE, AND, OR, MARKERS]
const field_list = ['eventtype', 'permanent', 'need_booking', 'price', 'status', 'is_fav', 'is_hurry', 'is_timed', 'estimate_time']

const enum_list = {
	'price': [ 'free', 'cheap', 'middle', 'expensive' ],
	'estimate_time': [ 'short', 'medium', 'long' ],
}

const field_type_list = {
	'eventtype': 'enum',
	'permanent': 'boolean',
	'need_booking': 'boolean',
	'price': 'enum',
	'estimate_time': 'enum',
	'status': 'enum',
	'is_fav': 'boolean',
	'is_hurry': 'boolean',
	'is_timed': 'boolean',
}

const joinList = (first, second) => {
	const no_dup = second.filter(s => first.indexOf(s) < 0)

	return first.concat(no_dup)
}

// OR -> filter then join
// AND -> filter then filter
const filterByField = (list, field, operator, value, eventtype_list) => {
	// for now operator might not be useful, it can be useful for ordering enum in the future
	const fieldType = field_type_list[field]
	const fieldName = field === 'eventtype' ? 'type' : field
	switch (fieldType) {
		case 'boolean': {
			let boolValue = value.toLowerCase() === 'true' ? true : false
			return list.filter(s => s[fieldName] === boolValue)
		}
		case 'enum': 
		default: {
			if (field === 'eventtype') {
				const typeObj = eventtype_list.find(s => s.label === value.toLowerCase())
				if (typeObj) {
					return list.filter(s => s.type === typeObj.value)
				}
				return list
			} else {
				if (operator === '=') {
					return list.filter(s => s[fieldName] === value)
				} else if (operator === '<') {
					return list.filter(s => s[fieldName] === value)
				} else if (operator === '>') {
					return list.filter(s => s[fieldName] === value)
				} else if (operator === '<=') {
					return list.filter(s => s[fieldName] === value)
				} else if (operator === '>=') {
					return list.filter(s => s[fieldName] === value)
				} else if (operator === '!=') {
					return list.filter(s => s[fieldName] !== value)
				}
				// for now, all the rest operators will return ===
				return list.filter(s => s[fieldName] === value)
			}
		}	
	}
}

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
	} else if (str.toUpperCase() === 'MARKERS') {
		return COLLECTION
	}
	return VAR
}

const checkFieldValid = (field, value, operator, eventtype_list) => {
	const fieldLower = field.toLowerCase()
	const fieldType = field_type_list[fieldLower]
	const toLower = value.toLowerCase()
	switch (fieldType) {
		case 'boolean': {
			if (toLower === 'true' || toLower === 'false') {
				if (operator === '=') {
					return {
						isValid: true,
					}
				} else {
					return {
						isValid: false,
						error: `boolean field expected operator =, got ${operator}`,
					}
				}
			} else {
				return {
					isValid: false,
					error: `${field} expected boolean, got ${value}`,
				}
			}
			break
		}
		case 'enum': {
			if (fieldLower === 'eventtype') {
				if (operator !== '=') {
					return {
						isValid: false,
						error: `eventtype field expected operator =, got ${operator}`
					}
				}
				const labelObj = eventtype_list.find(s => s.label === toLower)
				if (labelObj) {
					return {
						isValid: true,
					}
				} else {
					return {
						isValid: false,
						error: `${value} is not a type of ${fieldLower}`
					}
				}
			}
			const allowed_list = enum_list[field]
			if (allowed_list.includes(toLower)) {
				return {
					isValid: true,
				}
			} else {
				return {
					isValid: false,
					error: `${value} is not a type of ${fieldLower}`
				}
			}
			break
		}
		default: {
			return {
				isValid: false,
				error: `${field} type not found`
			}
		}
	}
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

const analysisQuery = (block_list, eventtype_list) => {
	// where there is any unknown block, return unknown
	for (let i = 0; i < block_list.length; i++) {
		if (block_list[i].type === UNKNOWN) {
			return {
				type: UNKNOWN,
				value: block_list[i].value,
			}
		}
	}

	if (block_list.length === 0) {
		// if the list is empty, return unknown
		return {
			type: UNKNOWN,
			value: 'empty list',
		}
	} else if (block_list.length === 1) {
		// if the list has only one value
		const first = block_list[0]
		if (first.type === NESTED) {
			// check if the list is nested
			const currentQuery = splitStringToBlock(first.value)
			if (currentQuery.error) {
				return {
					type: UNKNOWN,
					value: currentQuery.error,
				}
			}
			return analysisQuery(currentQuery.list, eventtype_list)
		} else {
			// return the original item if it is neither nested or unknown
			return block_list	
		}
	} else if (block_list.length === 2) {
		// no syntax should match 2 blocks only
		return {
			type: UNKNOWN,
			value: `Unexpected pattern at ${block_list[0].value} ${block_list[1].value}`,
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
			first = analysisQuery(currentQuery.list, eventtype_list)
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
			last = analysisQuery(currentQuery.list, eventtype_list)
			if (last.type === UNKNOWN) {
				return {
					type: UNKNOWN,
					value: last.value,
				}
			}
		}
		
		if (mid.type === JOIN) {
			// case for COLLECTION JOIN COLLECTION
			if (first.type === COLLECTION && last.type === COLLECTION) {
				return {
					type: COLLECTION,
					value: `${first.value} ${JOIN} ${last.value}`,
				}
			}
		} else if (mid.type === AND || mid.type === OR) {
			// case for STATEMENT AND STATEMENT or STATEMENT OR STATEMENT
			if (first.type === STATEMENT && last.type === STATEMENT) {
				return {
					type: STATEMENT,
					value: `${first.value} ${mid.value} ${last.value}`,
				}
			}
		} else if (mid.type === OPERATOR) {
			// case for FIELD OPERATOR VAR
			if (first.type === FIELD && last.type === VAR) {
				const validResult = checkFieldValid(first.value, last.value, mid.value, eventtype_list)
				if (validResult.isValid) {
					return {
						type: STATEMENT,
						value: `${first.value} ${mid.value} ${last.value}`,
					}
				} else {
					return {
						type: UNKNOWN,
						value: validResult.error,
					}
				}
			}
		}
		// if middle is none of the above, return unknown
		return {
			type: UNKNOWN,
			value: `Unexpected Pattern: ${first.value} ${mid.value} ${last.value}`,
		}
	} else {
		// in this case, it should have 3 or more blocks
		let first = block_list[0]
		let second = block_list[1]
		let third = block_list[2]
		if (first.type === SELECT && third.type === WHERE) {
			// case for SELECT COLLECTION WHERE STATEMENT
			if (second.type === NESTED) {
				const currentQuery = splitStringToBlock(second.value)
				if (currentQuery.error) {
					return {
						type: UNKNOWN,
						value: currentQuery.error,
					}
				}
				second = analysisQuery(currentQuery.list, eventtype_list)
				if (second.type === UNKNOWN) {
					return {
						type: UNKNOWN,
						value: second.value,
					}
				}
			}

			if (second.type === COLLECTION) {
				const rest = block_list.slice(3)
				const last = analysisQuery(rest, eventtype_list)
				if (last.type === STATEMENT) {
					return {
						type: COLLECTION,
						value: `${first.value} ${second.value} ${third.value} ${last.value}`
					}
				} else {
					return {
						type: UNKNOWN,
						value: `Expected statement but recieved ${last.value}`
					}
				}
			}
			return {
				type: UNKNOWN,
				value: 'invalid syntax with SELECT and WHERE'
			}
		} else if (first.type === FIELD && second.type === OPERATOR && third.type === VAR) {
			// case for FIELD OPERATOR VAR AND or OR
			const validResult = checkFieldValid(first.value, third.value, second.value, eventtype_list)
			if (!validResult.isValid) {
				return {
					type: UNKNOWN,
					value: validResult.error,
				}
			} else if (block_list.length >= 4) {
				const fourth = block_list[3]
				if (fourth.type === AND || fourth.type === OR) {
					const rest = block_list.slice(4)
					const last = analysisQuery(rest, eventtype_list)
					if (last.type === STATEMENT) {
						return {
							type: STATEMENT,
							value: `${first.value} ${second.value} ${third.value} ${fourth.value} ${last.value}`
						}
					} else {
						return {
							type: UNKNOWN,
							value: `Expected statement but recieved ${last.value}`,
						}
					}
				} else {
					return {
						type: UNKNOWN,
						value: `Expected Operator but recieved ${fourth.value}`
					}
				}
			} else {
				return {
					type: UNKNOWN,
					value: `Unknown pattern for ${first.value} ${second.value} ${third.value}`,
				}
			}
		} else if (first.type === NESTED && (second.type === AND || second.type === OR)) {
			// case for NESTED AND or NESTED OR
			const currentQuery = splitStringToBlock(first.value)
			if (currentQuery.error) {
				return {
					type: UNKNOWN,
					value: currentQuery.error,
				}
			}
			const finalFirst = analysisQuery(currentQuery.list, eventtype_list)
			if (finalFirst.type === STATEMENT) {
				const rest = block_list.slice(2)
				const last = analysisQuery(rest, eventtype_list)
				if (last.type === STATEMENT) {
					return {
						type: STATEMENT,
						value: `${finalFirst.value} ${second.value} ${last.value}`
					}
				} else {
					return {
						type: UNKNOWN,
						value: `Expected statement but recieved ${last.value}`,
					}
				}
			} else {
				return {
					type: UNKNOWN,
					value: `Expected statement but recieved ${finalFirst.value}`,
				}
			}
		} else if (second.type === JOIN) {
			// case for COLLECTION JOIN COLLECTION JOIN COLLECTION......
			if (first.type === NESTED) {
				const currentQuery = splitStringToBlock(first.value)
				if (currentQuery.error) {
					return {
						type: UNKNOWN,
						value: currentQuery.error,
					}
				}
				first = analysisQuery(currentQuery.list, eventtype_list)
				if (first.type === COLLECTION) {
					const rest = block_list.slice(2)
					const last = analysisQuery(rest, eventtype_list)
					if (last.type === COLLECTION) {
						return {
							type: COLLECTION,
							value: `${first.value} ${second.value} ${last.value}`
						}
					} else {
						return {
							type: UNKNOWN,
							value: `Expected collection but recieved ${last.value}`,
						}
					}
				} else {
					return {
						type: UNKNOWN,
						value: `Expected collection but recieved ${first.value}`,
					}
				}
			}
		} else {
			return {
				type: UNKNOWN,
				value: 'Unknown pattern',
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

const getListFromQueryFilter = (list, block_list, eventtype_list) => {
	if (block_list.length === 0) {
		return list
	} else if (block_list.length === 1) {
		const first = block_list[0]
		if (first.type === COLLECTION) {
			if (first.value === MARKERS) {
				return list
			} else {
				return list
			}
		} else if (first.type === NESTED) {
			const currentQuery = splitStringToBlock(first.value)
			if (currentQuery.error) {
				return list 
			}
			return getListFromQueryFilter(list, currentQuery.list, eventtype_list)
		} else {
			return list
		}
	} else if (block_list.length === 2) {
		return list 
	} else if (block_list.length === 3) {
		const first = block_list[0]
		const last = block_list[2]
		const mid = block_list[1]
		if (mid.type === JOIN) {
			// case for join
			// either collection or nested, but still the same function to get the list
			const firstList = getListFromQueryFilter(list, [first], eventtype_list)
			const lastList = getListFromQueryFilter(list, [last], eventtype_list)
			return joinList(firstList, lastList)
		} else if (first.type === FIELD && mid.type === OPERATOR && last.type === VAR) {
			// case for FIELD OPERATOR VAR
			return filterByField(list, first.value, mid.value, last.value, eventtype_list)
		} else {
			return list
		}
	} else {
		const first = block_list[0]
		const second = block_list[1]
		const third = block_list[2]
		if (first.type === SELECT && third.type === WHERE) {
			// case for SELECT COLLECTION WHERE STATEMENT
			let input_list = list
			if (second.type === NESTED || second.type === COLLECTION) {
				input_list = getListFromQueryFilter(list, [second], eventtype_list)
			}
			const rest = block_list.slice(3)
			return getListFromQueryFilter(input_list, rest, eventtype_list)
		} else if (first.type === FIELD && second.type === OPERATOR && third.type === VAR) {
			// case for FIELD OPERATOR VAR AND or OR
			const firstList = getListFromQueryFilter(list, [first, second, third], eventtype_list)
			const fourth = block_list[3]
			const rest = block_list.slice(4)
			if (fourth.value === AND) {
				return getListFromQueryFilter(firstList, rest, eventtype_list)
			} else if (fourth.value === OR) {
				const lastList = getListFromQueryFilter(list, rest, eventtype_list)
				return joinList(firstList, lastList)
			}
		} else if (first.type === NESTED && (second.type === AND || second.type == OR)) {
			// case for NESTED AND or NESTED OR
			const firstList = getListFromQueryFilter(list, [first], eventtype_list)
			const fourth = block_list[3]
			const rest = block_list.slice(2)
			if (fourth.value === AND) {
				return getListFromQueryFilter(firstList, rest, eventtype_list)
			} else if (fourth.value === OR) {
				const lastList = getListFromQueryFilter(list, rest, eventtype_list)
				return joinList(firstList, lastList)
			}
		} else if (second.type === JOIN) {
			// case for NESTED JOIN (COLLECTION)
			const firstList = getListFromQueryFilter(list, [first], eventtype_list)
			const rest = block_list.slice(2)
			const lastList = getListFromQueryFilter(list, rest, eventtype_list)
			return joinList(firstList, lastList)
		} else {
			return list
		}
	}
}

const validateQuery = (input_str, eventtype_list) => {
    const init_block = generateInitialBlock(input_str)
    const result = analysisQuery(init_block, eventtype_list)
    if (result.type === UNKNOWN) {
        return {
            error: result.value,
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

const parseQuery = (markers, input_str, eventtype_list) => {
	const init_block = generateInitialBlock(input_str)
	const result_list = getListFromQueryFilter(markers, init_block, eventtype_list)
	return result_list
}

const querys = {
    keyword_list,
    field_list,
    validate: validateQuery,
    parse: parseQuery,
}

export default querys