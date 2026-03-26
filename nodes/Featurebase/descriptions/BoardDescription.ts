import type { INodeProperties } from 'n8n-workflow';

export const boardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['board'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a board by ID',
				action: 'Get a board',
				routing: {
					request: {
						method: 'GET',
						url: '=/v2/boards/{{$parameter.boardId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all boards',
				action: 'Get many boards',
				routing: {
					request: {
						method: 'GET',
						url: '/v2/boards',
					},
				},
			},
		],
		default: 'getMany',
	},
];

export const boardFields: INodeProperties[] = [
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['get'],
			},
		},
		description: 'The ID of the board',
	},
];
