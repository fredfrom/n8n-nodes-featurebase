import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

import { postOperations, postFields } from './descriptions/PostDescription';
import { boardOperations, boardFields } from './descriptions/BoardDescription';
import { commentOperations, commentFields } from './descriptions/CommentDescription';
import { changelogOperations, changelogFields } from './descriptions/ChangelogDescription';
import { contactOperations, contactFields } from './descriptions/ContactDescription';

export class Featurebase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Featurebase',
		name: 'featurebase',
		icon: 'file:featurebase.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Featurebase API',
		defaults: {
			name: 'Featurebase',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'featurebaseApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://do.featurebase.app',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Board', value: 'board' },
					{ name: 'Changelog', value: 'changelog' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Post', value: 'post' },
				],
				default: 'post',
			},
			...postOperations,
			...postFields,
			...boardOperations,
			...boardFields,
			...commentOperations,
			...commentFields,
			...changelogOperations,
			...changelogFields,
			...contactOperations,
			...contactFields,
		],
	};
}
