import type { INodeProperties } from 'n8n-workflow';

export const postOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['post'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new post',
				action: 'Create a post',
				routing: {
					request: {
						method: 'POST',
						url: '/v2/posts',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a post',
				action: 'Delete a post',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/v2/posts/{{$parameter.postId}}',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a post by ID',
				action: 'Get a post',
				routing: {
					request: {
						method: 'GET',
						url: '=/v2/posts/{{$parameter.postId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many posts',
				action: 'Get many posts',
				routing: {
					request: {
						method: 'GET',
						url: '/v2/posts',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a post',
				action: 'Update a post',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/v2/posts/{{$parameter.postId}}',
					},
				},
			},
		],
		default: 'getMany',
	},
];

export const postFields: INodeProperties[] = [
	// ----------------------------------
	//         post: shared
	// ----------------------------------
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the post',
	},

	// ----------------------------------
	//         post: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['create'],
			},
		},
		description: 'The title of the post',
		routing: {
			send: {
				type: 'body',
				property: 'title',
			},
		},
	},
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['create'],
			},
		},
		description: 'The ID of the board to create the post in',
		routing: {
			send: {
				type: 'body',
				property: 'boardId',
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
				resource: ['post'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'The content/body of the post (supports HTML)',
				routing: {
					send: {
						type: 'body',
						property: 'content',
					},
				},
			},
			{
				displayName: 'Status ID',
				name: 'statusId',
				type: 'string',
				default: '',
				description: 'The status ID for the post (get IDs from the status object on existing posts)',
				routing: {
					send: {
						type: 'body',
						property: 'statusId',
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						value: '={{$value.split(",").map(t => t.trim()).filter(t => t)}}',
					},
				},
			},
			{
				displayName: 'Upvotes',
				name: 'upvotes',
				type: 'number',
				default: 1,
				description: 'Initial upvote count (set to 0 for no votes)',
				routing: {
					send: {
						type: 'body',
						property: 'upvotes',
					},
				},
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				default: 'public',
				options: [
					{ name: 'Public', value: 'public' },
					{ name: 'Author Only', value: 'authorOnly' },
					{ name: 'Company Only', value: 'companyOnly' },
				],
				routing: {
					send: {
						type: 'body',
						property: 'visibility',
					},
				},
			},
		],
	},

	// ----------------------------------
	//         post: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Board ID',
				name: 'boardId',
				type: 'string',
				default: '',
				description: 'Move the post to a different board',
				routing: {
					send: {
						type: 'body',
						property: 'boardId',
					},
				},
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'The new content of the post (supports HTML)',
				routing: {
					send: {
						type: 'body',
						property: 'content',
					},
				},
			},
			{
				displayName: 'Status ID',
				name: 'statusId',
				type: 'string',
				default: '',
				description: 'The new status ID for the post',
				routing: {
					send: {
						type: 'body',
						property: 'statusId',
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						value: '={{$value.split(",").map(t => t.trim()).filter(t => t)}}',
					},
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The new title of the post',
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
	//         post: getMany
	// ----------------------------------
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['post'],
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
				resource: ['post'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Board ID',
				name: 'boardId',
				type: 'string',
				default: '',
				description: 'Filter posts by board ID',
				routing: {
					send: {
						type: 'query',
						property: 'boardId',
					},
				},
			},
			{
				displayName: 'Search Query',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search posts by keyword',
				routing: {
					send: {
						type: 'query',
						property: 'q',
					},
				},
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				default: 'createdAt',
				options: [
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Recent', value: 'recent' },
					{ name: 'Trending', value: 'trending' },
					{ name: 'Upvotes', value: 'upvotes' },
				],
				routing: {
					send: {
						type: 'query',
						property: 'sortBy',
					},
				},
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				default: 'desc',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				routing: {
					send: {
						type: 'query',
						property: 'sortOrder',
					},
				},
			},
			{
				displayName: 'Status ID',
				name: 'statusId',
				type: 'string',
				default: '',
				description: 'Filter posts by status ID',
				routing: {
					send: {
						type: 'query',
						property: 'statusId',
					},
				},
			},
		],
	},
];
