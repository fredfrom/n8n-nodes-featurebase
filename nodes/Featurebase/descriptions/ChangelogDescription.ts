import type { INodeProperties } from 'n8n-workflow';

export const changelogOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['changelog'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a changelog entry',
				action: 'Create a changelog entry',
				routing: {
					request: {
						method: 'POST',
						url: '/v2/changelogs',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a changelog entry',
				action: 'Delete a changelog entry',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/v2/changelogs/{{$parameter.changelogId}}',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a changelog entry by ID',
				action: 'Get a changelog entry',
				routing: {
					request: {
						method: 'GET',
						url: '=/v2/changelogs/{{$parameter.changelogId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many changelog entries',
				action: 'Get many changelog entries',
				routing: {
					request: {
						method: 'GET',
						url: '/v2/changelogs',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a changelog entry',
				action: 'Update a changelog entry',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v2/changelogs/{{$parameter.changelogId}}',
					},
				},
			},
		],
		default: 'getMany',
	},
];

export const changelogFields: INodeProperties[] = [
	// ----------------------------------
	//         changelog: shared
	// ----------------------------------
	{
		displayName: 'Changelog ID',
		name: 'changelogId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['changelog'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the changelog entry',
	},

	// ----------------------------------
	//         changelog: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['changelog'],
				operation: ['create'],
			},
		},
		description: 'The title of the changelog entry',
		routing: {
			send: {
				type: 'body',
				property: 'title',
			},
		},
	},
	{
		displayName: 'HTML Content',
		name: 'htmlContent',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['changelog'],
				operation: ['create'],
			},
		},
		description: 'The HTML content of the changelog entry',
		routing: {
			send: {
				type: 'body',
				property: 'htmlContent',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['changelog'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Categories',
				name: 'categories',
				type: 'string',
				default: '',
				description: 'Comma-separated categories (e.g. New, Fixed, Improved)',
				routing: {
					send: {
						type: 'body',
						property: 'categories',
						value: '={{$value.split(",").map(t => t.trim()).filter(t => t)}}',
					},
				},
			},
			{
				displayName: 'Featured Image',
				name: 'featuredImage',
				type: 'string',
				default: '',
				description: 'URL of the featured image',
				routing: {
					send: {
						type: 'body',
						property: 'featuredImage',
					},
				},
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				default: 'draft',
				description: 'Whether to publish the changelog or save as draft',
				options: [
					{ name: 'Draft', value: 'draft' },
					{ name: 'Live', value: 'live' },
				],
				routing: {
					send: {
						type: 'body',
						property: 'state',
					},
				},
			},
		],
	},

	// ----------------------------------
	//         changelog: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['changelog'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Categories',
				name: 'categories',
				type: 'string',
				default: '',
				description: 'Comma-separated categories',
				routing: {
					send: {
						type: 'body',
						property: 'categories',
						value: '={{$value.split(",").map(t => t.trim()).filter(t => t)}}',
					},
				},
			},
			{
				displayName: 'HTML Content',
				name: 'htmlContent',
				type: 'string',
				typeOptions: { rows: 6 },
				default: '',
				description: 'The new HTML content',
				routing: {
					send: {
						type: 'body',
						property: 'htmlContent',
					},
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The new title',
				routing: {
					send: {
						type: 'body',
						property: 'title',
					},
				},
			},
		],
	},

	// ----------------------------------
	//         changelog: getMany
	// ----------------------------------
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['changelog'],
				operation: ['getMany'],
			},
		},
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['changelog'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Categories',
				name: 'categories',
				type: 'string',
				default: '',
				description: 'Filter by categories (comma-separated, e.g. New, Fixed)',
				routing: {
					send: {
						type: 'query',
						property: 'categories',
					},
				},
			},
			{
				displayName: 'Search Query',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search changelogs by keyword',
				routing: {
					send: {
						type: 'query',
						property: 'q',
					},
				},
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				default: 'all',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Live', value: 'live' },
				],
				routing: {
					send: {
						type: 'query',
						property: 'state',
					},
				},
			},
		],
	},
];
