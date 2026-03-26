import { Featurebase } from '../nodes/Featurebase/Featurebase.node';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

describe('Featurebase Node', () => {
	let node: Featurebase;
	let description: Featurebase['description'];
	let properties: INodeProperties[];

	beforeAll(() => {
		node = new Featurebase();
		description = node.description;
		properties = description.properties;
	});

	// ─── Helpers ────────────────────────────────────────────────────────

	function getResourceProp(): INodeProperties {
		return properties.find((p) => p.name === 'resource')!;
	}

	function getOperationProp(resource: string): INodeProperties {
		return properties.find(
			(p) =>
				p.name === 'operation' &&
				p.displayOptions?.show?.resource?.includes(resource),
		)!;
	}

	function getOperationOptions(resource: string): INodePropertyOptions[] {
		return getOperationProp(resource).options as INodePropertyOptions[];
	}

	function findField(name: string, resource: string, operation?: string): INodeProperties | undefined {
		return properties.find((p) => {
			if (p.name !== name) return false;
			const show = p.displayOptions?.show;
			if (!show) return false;
			if (!show.resource?.includes(resource)) return false;
			if (operation && !show.operation?.includes(operation)) return false;
			return true;
		});
	}

	function findOperationRouting(resource: string, operation: string) {
		const ops = getOperationOptions(resource);
		const op = ops.find((o) => o.value === operation);
		return (op as any)?.routing?.request;
	}

	// ─── Node metadata ─────────────────────────────────────────────────

	describe('node metadata', () => {
		it('should have the correct internal name', () => {
			expect(description.name).toBe('featurebase');
		});

		it('should have a display name', () => {
			expect(description.displayName).toBe('Featurebase');
		});

		it('should reference an SVG icon', () => {
			expect(description.icon).toBe('file:featurebase.svg');
		});

		it('should be version 1', () => {
			expect(description.version).toBe(1);
		});

		it('should have one main input and one main output', () => {
			expect(description.inputs).toEqual(['main']);
			expect(description.outputs).toEqual(['main']);
		});

		it('should require featurebaseApi credentials', () => {
			expect(description.credentials).toEqual([
				{ name: 'featurebaseApi', required: true },
			]);
		});

		it('should set the base URL to https://do.featurebase.app', () => {
			expect(description.requestDefaults!.baseURL).toBe(
				'https://do.featurebase.app',
			);
		});

		it('should set Accept and Content-Type headers', () => {
			const headers = description.requestDefaults!.headers!;
			expect(headers.Accept).toBe('application/json');
			expect(headers['Content-Type']).toBe('application/json');
		});
	});

	// ─── Resource picker ────────────────────────────────────────────────

	describe('resource selector', () => {
		it('should list all five resources', () => {
			const resourceProp = getResourceProp();
			const values = (resourceProp.options as INodePropertyOptions[]).map(
				(o) => o.value,
			);
			expect(values).toEqual(
				expect.arrayContaining([
					'board',
					'changelog',
					'comment',
					'contact',
					'post',
				]),
			);
		});

		it('should default to "post"', () => {
			expect(getResourceProp().default).toBe('post');
		});
	});

	// ─── Post resource ──────────────────────────────────────────────────

	describe('Post resource', () => {
		it('should expose create, delete, get, getMany, update operations', () => {
			const values = getOperationOptions('post').map((o) => o.value);
			expect(values).toEqual(
				expect.arrayContaining([
					'create',
					'delete',
					'get',
					'getMany',
					'update',
				]),
			);
		});

		describe('create', () => {
			it('should POST to /v2/posts', () => {
				const routing = findOperationRouting('post', 'create');
				expect(routing.method).toBe('POST');
				expect(routing.url).toBe('/v2/posts');
			});

			it('should require title and boardId', () => {
				const title = findField('title', 'post', 'create');
				const boardId = findField('boardId', 'post', 'create');
				expect(title).toBeDefined();
				expect(title!.required).toBe(true);
				expect(boardId).toBeDefined();
				expect(boardId!.required).toBe(true);
			});

			it('should send title in request body', () => {
				const title = findField('title', 'post', 'create');
				expect((title as any).routing.send.type).toBe('body');
				expect((title as any).routing.send.property).toBe('title');
			});

			it('should send boardId in request body', () => {
				const boardId = findField('boardId', 'post', 'create');
				expect((boardId as any).routing.send.type).toBe('body');
				expect((boardId as any).routing.send.property).toBe('boardId');
			});

			it('should have additionalFields with content, statusId, tags, upvotes, and visibility', () => {
				const af = findField('additionalFields', 'post', 'create');
				expect(af).toBeDefined();
				expect(af!.type).toBe('collection');
				const names = (af!.options as INodeProperties[]).map((o) => o.name);
				expect(names).toEqual(
					expect.arrayContaining(['content', 'statusId', 'tags', 'upvotes', 'visibility']),
				);
			});

			it('should send tags as a split array expression', () => {
				const af = findField('additionalFields', 'post', 'create');
				const tagsProp = (af!.options as INodeProperties[]).find(
					(o) => o.name === 'tags',
				)!;
				const routing = (tagsProp as any).routing.send;
				expect(routing.property).toBe('tags');
				expect(routing.value).toContain('split');
				expect(routing.value).toContain('trim');
			});
		});

		describe('get', () => {
			it('should GET /v2/posts/{postId}', () => {
				const routing = findOperationRouting('post', 'get');
				expect(routing.method).toBe('GET');
				expect(routing.url).toContain('/v2/posts/');
				expect(routing.url).toContain('postId');
			});

			it('should require postId', () => {
				const postId = findField('postId', 'post', 'get');
				expect(postId).toBeDefined();
				expect(postId!.required).toBe(true);
			});
		});

		describe('getMany', () => {
			it('should GET /v2/posts', () => {
				const routing = findOperationRouting('post', 'getMany');
				expect(routing.method).toBe('GET');
				expect(routing.url).toBe('/v2/posts');
			});

			it('should have a limit parameter sent as query', () => {
				const limit = findField('limit', 'post', 'getMany');
				expect(limit).toBeDefined();
				expect(limit!.type).toBe('number');
				expect((limit as any).routing.send.type).toBe('query');
				expect((limit as any).routing.send.property).toBe('limit');
			});

			it('should enforce minValue of 1 on limit', () => {
				const limit = findField('limit', 'post', 'getMany');
				expect(limit!.typeOptions).toEqual({ minValue: 1 });
			});

			it('should default limit to 50', () => {
				const limit = findField('limit', 'post', 'getMany');
				expect(limit!.default).toBe(50);
			});

			it('should have filters collection with boardId, sortBy, statusId', () => {
				const filters = findField('filters', 'post', 'getMany');
				expect(filters).toBeDefined();
				expect(filters!.type).toBe('collection');
				const names = (filters!.options as INodeProperties[]).map(
					(o) => o.name,
				);
				expect(names).toEqual(
					expect.arrayContaining(['boardId', 'sortBy', 'statusId']),
				);
			});

			it('should send filter boardId as query param', () => {
				const filters = findField('filters', 'post', 'getMany');
				const boardIdFilter = (filters!.options as INodeProperties[]).find(
					(o) => o.name === 'boardId',
				)!;
				expect((boardIdFilter as any).routing.send.type).toBe('query');
				expect((boardIdFilter as any).routing.send.property).toBe('boardId');
			});

			it('should offer sortBy options: createdAt, recent, trending, upvotes', () => {
				const filters = findField('filters', 'post', 'getMany');
				const sortBy = (filters!.options as INodeProperties[]).find(
					(o) => o.name === 'sortBy',
				)!;
				const sortValues = (sortBy.options as INodePropertyOptions[]).map(
					(o) => o.value,
				);
				expect(sortValues).toEqual(['createdAt', 'recent', 'trending', 'upvotes']);
			});
		});

		describe('update', () => {
			it('should PATCH /v2/posts/{postId}', () => {
				const routing = findOperationRouting('post', 'update');
				expect(routing.method).toBe('PATCH');
				expect(routing.url).toContain('/v2/posts/');
				expect(routing.url).toContain('postId');
			});

			it('should require postId', () => {
				const postId = findField('postId', 'post', 'update');
				expect(postId).toBeDefined();
				expect(postId!.required).toBe(true);
			});

			it('should have updateFields with boardId, content, statusId, tags, title', () => {
				const uf = findField('updateFields', 'post', 'update');
				expect(uf).toBeDefined();
				const names = (uf!.options as INodeProperties[]).map((o) => o.name);
				expect(names).toEqual(
					expect.arrayContaining([
						'boardId',
						'content',
						'statusId',
						'tags',
						'title',
					]),
				);
			});

			it('should have updateFields options alphabetized by name', () => {
				const uf = findField('updateFields', 'post', 'update');
				const names = (uf!.options as INodeProperties[]).map((o) => o.name);
				const sorted = [...names].sort();
				expect(names).toEqual(sorted);
			});
		});

		describe('delete', () => {
			it('should DELETE /v2/posts/{postId}', () => {
				const routing = findOperationRouting('post', 'delete');
				expect(routing.method).toBe('DELETE');
				expect(routing.url).toContain('/v2/posts/');
				expect(routing.url).toContain('postId');
			});

			it('should require postId', () => {
				const postId = findField('postId', 'post', 'delete');
				expect(postId).toBeDefined();
				expect(postId!.required).toBe(true);
			});
		});
	});

	// ─── Board resource ─────────────────────────────────────────────────

	describe('Board resource', () => {
		it('should expose get and getMany operations only', () => {
			const values = getOperationOptions('board').map((o) => o.value);
			expect(values).toEqual(expect.arrayContaining(['get', 'getMany']));
			expect(values).toHaveLength(2);
		});

		describe('get', () => {
			it('should GET /v2/boards/{boardId}', () => {
				const routing = findOperationRouting('board', 'get');
				expect(routing.method).toBe('GET');
				expect(routing.url).toContain('/v2/boards/');
				expect(routing.url).toContain('boardId');
			});

			it('should require boardId', () => {
				const boardId = findField('boardId', 'board', 'get');
				expect(boardId).toBeDefined();
				expect(boardId!.required).toBe(true);
			});
		});

		describe('getMany', () => {
			it('should GET /v2/boards', () => {
				const routing = findOperationRouting('board', 'getMany');
				expect(routing.method).toBe('GET');
				expect(routing.url).toBe('/v2/boards');
			});
		});
	});

	// ─── Comment resource ───────────────────────────────────────────────

	describe('Comment resource', () => {
		it('should expose create, delete, getMany operations', () => {
			const values = getOperationOptions('comment').map((o) => o.value);
			expect(values).toEqual(
				expect.arrayContaining(['create', 'delete', 'getMany']),
			);
			expect(values).toHaveLength(3);
		});

		describe('create', () => {
			it('should POST to /v2/comment', () => {
				const routing = findOperationRouting('comment', 'create');
				expect(routing.method).toBe('POST');
				expect(routing.url).toBe('/v2/comment');
			});

			it('should require postId and content', () => {
				const postId = findField('postId', 'comment', 'create');
				const content = findField('content', 'comment', 'create');
				expect(postId).toBeDefined();
				expect(postId!.required).toBe(true);
				expect(content).toBeDefined();
				expect(content!.required).toBe(true);
			});

			it('should send content in request body', () => {
				const content = findField('content', 'comment', 'create');
				expect((content as any).routing.send.type).toBe('body');
				expect((content as any).routing.send.property).toBe('content');
			});

			it('should have additionalFields with isPrivate option', () => {
				const af = findField('additionalFields', 'comment', 'create');
				expect(af).toBeDefined();
				const names = (af!.options as INodeProperties[]).map((o) => o.name);
				expect(names).toContain('isPrivate');
			});

			it('should send isPrivate as body param', () => {
				const af = findField('additionalFields', 'comment', 'create');
				const isPrivate = (af!.options as INodeProperties[]).find(
					(o) => o.name === 'isPrivate',
				)!;
				expect((isPrivate as any).routing.send.type).toBe('body');
				expect((isPrivate as any).routing.send.property).toBe('isPrivate');
				expect(isPrivate.type).toBe('boolean');
				expect(isPrivate.default).toBe(false);
			});
		});

		describe('delete', () => {
			it('should DELETE /v2/comments/{commentId}', () => {
				const routing = findOperationRouting('comment', 'delete');
				expect(routing.method).toBe('DELETE');
				expect(routing.url).toContain('/v2/comments/');
				expect(routing.url).toContain('commentId');
			});

			it('should require commentId', () => {
				const commentId = findField('commentId', 'comment', 'delete');
				expect(commentId).toBeDefined();
				expect(commentId!.required).toBe(true);
			});
		});

		describe('getMany', () => {
			it('should GET /v2/comment', () => {
				const routing = findOperationRouting('comment', 'getMany');
				expect(routing.method).toBe('GET');
				expect(routing.url).toBe('/v2/comment');
			});

			it('should require postId', () => {
				const postId = findField('postId', 'comment', 'getMany');
				expect(postId).toBeDefined();
				expect(postId!.required).toBe(true);
			});

			it('should have a limit parameter', () => {
				const limit = findField('limit', 'comment', 'getMany');
				expect(limit).toBeDefined();
				expect(limit!.default).toBe(50);
				expect((limit as any).routing.send.type).toBe('query');
			});
		});
	});

	// ─── Changelog resource ─────────────────────────────────────────────

	describe('Changelog resource', () => {
		it('should expose create, delete, get, getMany, update operations', () => {
			const values = getOperationOptions('changelog').map((o) => o.value);
			expect(values).toEqual(
				expect.arrayContaining([
					'create',
					'delete',
					'get',
					'getMany',
					'update',
				]),
			);
		});

		describe('create', () => {
			it('should POST to /v2/changelogs', () => {
				const routing = findOperationRouting('changelog', 'create');
				expect(routing.method).toBe('POST');
				expect(routing.url).toBe('/v2/changelogs');
			});

			it('should require title and htmlContent', () => {
				const title = findField('title', 'changelog', 'create');
				const htmlContent = findField('htmlContent', 'changelog', 'create');
				expect(title!.required).toBe(true);
				expect(htmlContent!.required).toBe(true);
			});

			it('should have htmlContent with rows typeOption for multiline', () => {
				const htmlContent = findField('htmlContent', 'changelog', 'create');
				expect(htmlContent!.typeOptions).toEqual({ rows: 6 });
			});

			it('should have additionalFields with categories, featuredImage, and state', () => {
				const af = findField('additionalFields', 'changelog', 'create');
				const names = (af!.options as INodeProperties[]).map((o) => o.name);
				expect(names).toEqual(
					expect.arrayContaining(['categories', 'featuredImage', 'state']),
				);
			});

			it('should send state as body options field', () => {
				const af = findField('additionalFields', 'changelog', 'create');
				const state = (af!.options as INodeProperties[]).find(
					(o) => o.name === 'state',
				)!;
				expect(state.type).toBe('options');
				expect(state.default).toBe('draft');
				expect((state as any).routing.send.property).toBe('state');
			});
		});

		describe('get', () => {
			it('should GET /v2/changelogs/{changelogId}', () => {
				const routing = findOperationRouting('changelog', 'get');
				expect(routing.method).toBe('GET');
				expect(routing.url).toContain('/v2/changelogs/');
				expect(routing.url).toContain('changelogId');
			});

			it('should require changelogId', () => {
				const id = findField('changelogId', 'changelog', 'get');
				expect(id!.required).toBe(true);
			});
		});

		describe('getMany', () => {
			it('should GET /v2/changelogs', () => {
				const routing = findOperationRouting('changelog', 'getMany');
				expect(routing.method).toBe('GET');
				expect(routing.url).toBe('/v2/changelogs');
			});

			it('should have a limit parameter', () => {
				const limit = findField('limit', 'changelog', 'getMany');
				expect(limit).toBeDefined();
			});
		});

		describe('update', () => {
			it('should PATCH /v2/changelogs/{changelogId}', () => {
				const routing = findOperationRouting('changelog', 'update');
				expect(routing.method).toBe('PATCH');
				expect(routing.url).toContain('/v2/changelogs/');
			});

			it('should have updateFields with categories, htmlContent, title', () => {
				const uf = findField('updateFields', 'changelog', 'update');
				const names = (uf!.options as INodeProperties[]).map((o) => o.name);
				expect(names).toEqual(
					expect.arrayContaining([
						'categories',
						'htmlContent',
						'title',
					]),
				);
			});
		});

		describe('delete', () => {
			it('should DELETE /v2/changelogs/{changelogId}', () => {
				const routing = findOperationRouting('changelog', 'delete');
				expect(routing.method).toBe('DELETE');
				expect(routing.url).toContain('/v2/changelogs/');
			});
		});
	});

	// ─── Contact resource ───────────────────────────────────────────────

	describe('Contact resource', () => {
		it('should expose upsert, get, getMany operations (no delete)', () => {
			const values = getOperationOptions('contact').map((o) => o.value);
			expect(values).toEqual(
				expect.arrayContaining(['upsert', 'get', 'getMany']),
			);
			expect(values).not.toContain('delete');
		});

		describe('upsert', () => {
			it('should POST to /v2/contacts', () => {
				const routing = findOperationRouting('contact', 'upsert');
				expect(routing.method).toBe('POST');
				expect(routing.url).toBe('/v2/contacts');
			});

			it('should require email', () => {
				const email = findField('email', 'contact', 'upsert');
				expect(email).toBeDefined();
				expect(email!.required).toBe(true);
			});

			it('should send email in request body', () => {
				const email = findField('email', 'contact', 'upsert');
				expect((email as any).routing.send.type).toBe('body');
				expect((email as any).routing.send.property).toBe('email');
			});

			it('should have additionalFields with name and companyId', () => {
				const af = findField('additionalFields', 'contact', 'upsert');
				const names = (af!.options as INodeProperties[]).map((o) => o.name);
				expect(names).toEqual(
					expect.arrayContaining(['name', 'companyId']),
				);
			});
		});

		describe('get', () => {
			it('should GET /v2/contacts/{contactId}', () => {
				const routing = findOperationRouting('contact', 'get');
				expect(routing.method).toBe('GET');
				expect(routing.url).toContain('/v2/contacts/');
				expect(routing.url).toContain('contactId');
			});

			it('should require contactId', () => {
				const id = findField('contactId', 'contact', 'get');
				expect(id!.required).toBe(true);
			});
		});

		describe('getMany', () => {
			it('should GET /v2/contacts', () => {
				const routing = findOperationRouting('contact', 'getMany');
				expect(routing.method).toBe('GET');
				expect(routing.url).toBe('/v2/contacts');
			});

			it('should have a limit parameter', () => {
				const limit = findField('limit', 'contact', 'getMany');
				expect(limit).toBeDefined();
				expect(limit!.default).toBe(50);
			});
		});
	});

	// ─── Cross-cutting concerns ─────────────────────────────────────────

	describe('cross-cutting concerns', () => {
		it('every operation should have an action string for the UI', () => {
			const resources = ['post', 'board', 'comment', 'changelog', 'contact'];
			for (const resource of resources) {
				const ops = getOperationOptions(resource);
				for (const op of ops) {
					expect(op.action).toBeTruthy();
				}
			}
		});

		it('every operation should define routing with method and url', () => {
			const resources = ['post', 'board', 'comment', 'changelog', 'contact'];
			for (const resource of resources) {
				const ops = getOperationOptions(resource);
				for (const op of ops) {
					const routing = (op as any).routing?.request;
					expect(routing).toBeDefined();
					expect(routing.method).toBeTruthy();
					expect(routing.url).toBeTruthy();
				}
			}
		});

		it('all getMany operations (except board) should have a limit field', () => {
			const resources = ['post', 'comment', 'changelog', 'contact'];
			for (const resource of resources) {
				const limit = findField('limit', resource, 'getMany');
				expect(limit).toBeDefined();
				expect(limit!.type).toBe('number');
				expect(limit!.typeOptions).toEqual({ minValue: 1 });
			}
		});

		it('no operation URLs should contain hardcoded IDs', () => {
			const resources = ['post', 'board', 'comment', 'changelog', 'contact'];
			for (const resource of resources) {
				const ops = getOperationOptions(resource);
				for (const op of ops) {
					const url = (op as any).routing?.request?.url as string;
					// dynamic URLs use expression syntax, static ones are clean paths
					expect(url).not.toMatch(/\/[a-f0-9]{24}/);
				}
			}
		});
	});
});
