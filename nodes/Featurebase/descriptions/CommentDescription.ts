import type { INodeProperties } from 'n8n-workflow';

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a comment on a post',
				action: 'Create a comment',
				routing: {
					request: {
						method: 'POST',
						url: '/v2/comment',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a comment',
				action: 'Delete a comment',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/v2/comments/{{$parameter.commentId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many comments on a post',
				action: 'Get many comments',
				routing: {
					request: {
						method: 'GET',
						url: '/v2/comment',
					},
				},
			},
		],
		default: 'getMany',
	},
];

export const commentFields: INodeProperties[] = [
	// ----------------------------------
	//         comment: create
	// ----------------------------------
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create'],
			},
		},
		description: 'The ID of the post to comment on',
		routing: {
			send: {
				type: 'body',
				property: 'postId',
			},
		},
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create'],
			},
		},
		description: 'The content of the comment (supports HTML)',
		routing: {
			send: {
				type: 'body',
				property: 'content',
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
				resource: ['comment'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Is Private',
				name: 'isPrivate',
				type: 'boolean',
				default: false,
				description: 'Whether the comment is private (internal note)',
				routing: {
					send: {
						type: 'body',
						property: 'isPrivate',
					},
				},
			},
		],
	},

	// ----------------------------------
	//         comment: delete
	// ----------------------------------
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['delete'],
			},
		},
		description: 'The ID of the comment to delete',
	},

	// ----------------------------------
	//         comment: getMany
	// ----------------------------------
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getMany'],
			},
		},
		description: 'The ID of the post to get comments for',
		routing: {
			send: {
				type: 'query',
				property: 'postId',
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['comment'],
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
				resource: ['comment'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Privacy',
				name: 'privacy',
				type: 'options',
				default: 'all',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
				],
				routing: {
					send: {
						type: 'query',
						property: 'privacy',
					},
				},
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				default: 'new',
				options: [
					{ name: 'Best', value: 'best' },
					{ name: 'New', value: 'new' },
					{ name: 'Old', value: 'old' },
					{ name: 'Top', value: 'top' },
				],
				routing: {
					send: {
						type: 'query',
						property: 'sortBy',
					},
				},
			},
		],
	},
];
