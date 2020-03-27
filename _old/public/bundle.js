
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Header.svelte generated by Svelte v3.6.8 */

    const file = "src/Header.svelte";

    function create_fragment(ctx) {
    	var header, svg, path;

    	return {
    		c: function create() {
    			header = element("header");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "M35.2114674,9.90088871 C34.4018592,9.33913616 32.5465072,9.12847895 31.0959592,9.40935523 C30.9272908,8.00497385 30.1514163,6.77614015 28.8020694,5.68774458 L28.0261949,5.12599203 L27.4864561,5.93351132 C26.8117826,6.98679735 26.4744459,8.4613978 26.5756469,9.86577918 C26.6093806,10.3573127 26.778049,11.235051 27.2840541,12.0074608 C26.8117826,12.2883371 25.8335061,12.6394324 24.5516265,12.6394324 L0.16218026,12.6394324 L0.0947129121,12.9203087 C-0.141422805,14.32469 -0.141422805,18.7133819 2.62473845,22.0838972 C4.71622623,24.6468932 7.81972423,25.9459459 11.9014988,25.9459459 C20.7397213,25.9459459 27.2840541,21.6976923 30.3538184,14.0087042 C31.5682306,14.0438138 34.1657235,14.0087042 35.4813368,11.3754892 C35.5150705,11.3052701 35.5825378,11.1648319 35.8186736,10.6381889 L35.9536082,10.3573127 L35.2114674,9.90088871 L35.2114674,9.90088871 Z M19.6602438,0 L15.9495396,0 L15.9495396,3.51095344 L19.6602438,3.51095344 L19.6602438,0 L19.6602438,0 Z M19.6602438,4.21314413 L15.9495396,4.21314413 L15.9495396,7.72409758 L19.6602438,7.72409758 L19.6602438,4.21314413 L19.6602438,4.21314413 Z M15.2748662,4.21314413 L11.564162,4.21314413 L11.564162,7.72409758 L15.2748662,7.72409758 L15.2748662,4.21314413 L15.2748662,4.21314413 Z M10.8894886,4.21314413 L7.17878443,4.21314413 L7.17878443,7.72409758 L10.8894886,7.72409758 L10.8894886,4.21314413 L10.8894886,4.21314413 Z M6.50411095,8.42628826 L2.79340682,8.42628826 L2.79340682,11.9372417 L6.50411095,11.9372417 L6.50411095,8.42628826 L6.50411095,8.42628826 Z M10.8894886,8.42628826 L7.17878443,8.42628826 L7.17878443,11.9372417 L10.8894886,11.9372417 L10.8894886,8.42628826 L10.8894886,8.42628826 Z M15.2748662,8.42628826 L11.564162,8.42628826 L11.564162,11.9372417 L15.2748662,11.9372417 L15.2748662,8.42628826 L15.2748662,8.42628826 Z M19.6602438,8.42628826 L15.9495396,8.42628826 L15.9495396,11.9372417 L19.6602438,11.9372417 L19.6602438,8.42628826 L19.6602438,8.42628826 Z M24.0456214,8.42628826 L20.3349172,8.42628826 L20.3349172,11.9372417 L24.0456214,11.9372417 L24.0456214,8.42628826 L24.0456214,8.42628826 Z");
    			add_location(path, file, 19, 164, 443);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "preserveAspectRatio", "xMidYMid meet");
    			attr(svg, "class", "dicon styles__dockerFlat___2woUp styles__large___2556i  svelte-nd7v2x");
    			attr(svg, "viewBox", "0 0 36 26");
    			add_location(svg, file, 19, 4, 283);
    			attr(header, "class", "svelte-nd7v2x");
    			add_location(header, file, 18, 0, 270);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, header, anchor);
    			append(header, svg);
    			append(svg, path);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(header);
    			}
    		}
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const isBlocked = writable(true);

    const dispatch = (eventName, data = undefined) => {
        window.dispatchEvent(new CustomEvent(eventName), {
            'detail': data
        });
    };

    /* src/DockerImgs.svelte generated by Svelte v3.6.8 */
    const {
    	Error: Error_1,
    	Object: Object_1,
    	console: console_1
    } = globals;

    const file$1 = "src/DockerImgs.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.tag = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.catalog = list[i];
    	return child_ctx;
    }

    // (255:2) {:else}
    function create_else_block(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Docker images not found";
    			attr(p, "class", "svelte-z6dcff");
    			add_location(p, file$1, 255, 4, 5460);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (243:6) {#each tags[catalog] as tag}
    function create_each_block_1(ctx) {
    	var tr, td0, t0_value = ctx.catalog, t0, t1, td1, t2_value = ctx.tag.tag, t2, t3, td2, t4_value = new Date(ctx.tag.history[0].v1Compatibility.created).toLocaleString(), t4, tr_id_value, createRow_action, dispose;

    	return {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			attr(td0, "class", "catalog svelte-z6dcff");
    			add_location(td0, file$1, 248, 10, 5226);
    			attr(td1, "class", "tag svelte-z6dcff");
    			add_location(td1, file$1, 249, 10, 5271);
    			attr(td2, "class", "created svelte-z6dcff");
    			add_location(td2, file$1, 250, 10, 5312);
    			attr(tr, "id", tr_id_value = `${ctx.catalog}-${ctx.tag.tag}`);
    			attr(tr, "class", "svelte-z6dcff");
    			toggle_class(tr, "active", ctx.selectedFromUrl.has(`${ctx.catalog}-${ctx.tag.tag}`));
    			add_location(tr, file$1, 243, 8, 5044);
    			dispose = listen(tr, "click", ctx.onRowClicked);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			createRow_action = ctx.createRow.call(null, tr) || {};
    		},

    		p: function update(changed, ctx) {
    			if ((changed.catalogs) && t0_value !== (t0_value = ctx.catalog)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.tags || changed.catalogs) && t2_value !== (t2_value = ctx.tag.tag)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.tags || changed.catalogs) && t4_value !== (t4_value = new Date(ctx.tag.history[0].v1Compatibility.created).toLocaleString())) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.catalogs || changed.tags) && tr_id_value !== (tr_id_value = `${ctx.catalog}-${ctx.tag.tag}`)) {
    				attr(tr, "id", tr_id_value);
    			}

    			if ((changed.selectedFromUrl || changed.catalogs || changed.tags)) {
    				toggle_class(tr, "active", ctx.selectedFromUrl.has(`${ctx.catalog}-${ctx.tag.tag}`));
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}

    			if (createRow_action && typeof createRow_action.destroy === 'function') createRow_action.destroy();
    			dispose();
    		}
    	};
    }

    // (241:2) {#each catalogs as catalog}
    function create_each_block(ctx) {
    	var tbody, t;

    	var each_value_1 = ctx.tags[ctx.catalog];

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			tbody = element("tbody");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr(tbody, "class", "svelte-z6dcff");
    			add_location(tbody, file$1, 241, 4, 4993);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tbody, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append(tbody, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.catalogs || changed.tags || changed.selectedFromUrl) {
    				each_value_1 = ctx.tags[ctx.catalog];

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tbody);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var table_1, dispose;

    	var each_value = ctx.catalogs;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	var each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block();
    		each_1_else.c();
    	}

    	return {
    		c: function create() {
    			table_1 = element("table");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(table_1, "class", "svelte-z6dcff");
    			add_location(table_1, file$1, 239, 0, 4933);
    			dispose = listen(window, "dockerimgs:refresh", ctx.refresh);
    		},

    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, table_1, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table_1, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(table_1, null);
    			}

    			ctx.table_1_binding(table_1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.tags || changed.catalogs || changed.selectedFromUrl) {
    				each_value = ctx.catalogs;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table_1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block();
    				each_1_else.c();
    				each_1_else.m(table_1, null);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(table_1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();

    			ctx.table_1_binding(null);
    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { catalogs = [], tags = {}, table = null } = $$props;

      const selectedFromUrl = new Set(new URL(location).searchParams.getAll("row"));

      let cntRows = 0;
      const createRow = (row, a, b) => {
        row.setAttribute("data-pos", cntRows++);  };

      let lastClickedRow = null;
      const onRowClicked = event => {
        let tr = null;
        for (const el of event.path) {
          if (el.tagName == "TR") {
            tr = el;
            break;
          }
        }

        if (!!!tr) {
          return console.warn("Not found clicked row", event);
        }

        if (event.ctrlKey) {
          tr.classList.toggle("active");
        } else if (event.shiftKey) {
          if (!!!lastClickedRow) {
            tr.classList.toggle("active");
          } else if (!tr.classList.contains("active")) {
            const lastPos = parseInt(lastClickedRow.getAttribute("data-pos"));
            const curPos = parseInt(tr.getAttribute("data-pos"));
            for (
              let pos = Math.min(lastPos, curPos);
              pos <= Math.max(lastPos, curPos);
              ++pos
            ) {
              table.querySelector(`tr[data-pos="${pos}"]`).classList.add("active");
            }
          }
        } else {
          if (!tr.classList.contains("active")) {
            for (const el of table.querySelectorAll("tr.active")) {
              el.classList.remove("active");
            }
          }
          tr.classList.toggle("active");
        }

        lastClickedRow = tr.classList.contains("active") ? tr : null;
      };

      let isCatalogFetch = false;

      const refresh = () => {
        if (isCatalogFetch) {
          return;
        }

        isCatalogFetch = true;

        isBlocked.set(true);

        let _tags = null;
        let _catalogs = null;

        fetch("/api/catalog")
          .then(res => {
            if (res.status != 200) {
              throw new Error(res.status);
            }
            return res.json();
          })
          .then(data => {
            _catalogs = Object.keys(data).sort();
            _tags = _catalogs.reduce((acm, key) => {
              acm[key] = data[key].sort();
              return acm;
            }, {});

            return Promise.all(
              _catalogs.reduce((acm, catalog) => {
                acm.push(
                  ..._tags[catalog].map(tag =>
                    fetch(`/api/manifests?repo=${catalog}&tag=${tag}`)
                  )
                );
                return acm;
              }, [])
            );
          })
          .then(responses => {
            return Promise.all(
              responses.map(res => {
                if (res.status != 200) {
                  throw new Error(res.status);
                }
                return res.json();
              })
            );
          })
          .then(manifests => {
            for (const manifest of manifests) {
              const tmp = _tags[manifest.name];
              const pos = tmp.findIndex(tag => tag == manifest.tag);
              tmp[pos] = manifest;
            }

            return Promise.resolve();
          })
          .then(() => {
            for (const name in _tags) {
              _tags[name].sort(
                (l, r) => l.history[0].v1Compatibility.created - r.history[0].v1Compatibility.created
              );
            }
            
            $$invalidate('catalogs', catalogs = _catalogs);
            $$invalidate('tags', tags = _tags);
          })
          .catch(err => {
            console.warn(err);
            alert("Error get images");
          })
          .finally(() => {
            selectedFromUrl.clear();
            isCatalogFetch = false;
            isBlocked.set(false);
            dispatch("dockerimgs:refreshed");
          });
      };

      refresh();

    	const writable_props = ['catalogs', 'tags', 'table'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<DockerImgs> was created with unknown prop '${key}'`);
    	});

    	function table_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('table', table = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('catalogs' in $$props) $$invalidate('catalogs', catalogs = $$props.catalogs);
    		if ('tags' in $$props) $$invalidate('tags', tags = $$props.tags);
    		if ('table' in $$props) $$invalidate('table', table = $$props.table);
    	};

    	return {
    		catalogs,
    		tags,
    		table,
    		selectedFromUrl,
    		createRow,
    		onRowClicked,
    		refresh,
    		table_1_binding
    	};
    }

    class DockerImgs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["catalogs", "tags", "table"]);
    	}

    	get catalogs() {
    		throw new Error_1("<DockerImgs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set catalogs(value) {
    		throw new Error_1("<DockerImgs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tags() {
    		throw new Error_1("<DockerImgs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tags(value) {
    		throw new Error_1("<DockerImgs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table() {
    		throw new Error_1("<DockerImgs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error_1("<DockerImgs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Save.svelte generated by Svelte v3.6.8 */
    const {
    	Error: Error_1$1,
    	console: console_1$1,
    	window: window_1
    } = globals;

    const file$2 = "src/Save.svelte";

    function create_fragment$2(ctx) {
    	var button, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Save";
    			attr(button, "class", "svelte-s5zyxe");
    			add_location(button, file$2, 127, 0, 2730);

    			dispose = [
    				listen(window_1, "dockerimgs:refreshed", ctx.onDockerimgsRefreshed),
    				listen(button, "click", ctx.click)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			ctx.button_binding(button);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			ctx.button_binding(null);
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { table = null, btn = null } = $$props;

      let saving = !!(new URL(location).searchParams.get("save"));

      const download = uri => {
        return new Promise(resolve => {
          let filename = null;
          fetch(uri)
            .then(res => {
              if (res.status != 200) {
                throw new Error(res.status);
              }

              const regex = /filename[^;=\n]*=(UTF-8(['"]*))?(.*)/;
              const matches = regex.exec(res.headers.get("content-disposition"));

              if (matches != null && matches[3]) {
                filename = matches[3].replace(/['"]/g, "");
              }

              return res.blob();
            })
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              setInterval(() => {
                a.remove();
              }, 100);
            })
            .catch(err => {
              console.warn(err);
              alert(`Error download ${uri}`);
            })
            .finally(resolve);
        });
      };

      const click = () => {
        const actives = [...table.querySelectorAll("tr.active")];
        if (actives.length == 0) {
          return alert("Not select images");
        }
        isBlocked.set(true);

        const _download = () => {
          if (actives.length == 0) {
            isBlocked.set(false);

            return;
          }

          const row = actives.pop();
          download(
            `/api/save?repo=${row.querySelector(".catalog").innerText}&tag=${
          row.querySelector(".tag").innerText
        }`
          ).finally(() => {
              row.classList.remove('active');
            _download();
          });
        };

        _download();
      };

      const onDockerimgsRefreshed = () => {
        if(saving) {
          saving = false;
          click();
        }
      };

    	const writable_props = ['table', 'btn'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1$1.warn(`<Save> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('btn', btn = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('table' in $$props) $$invalidate('table', table = $$props.table);
    		if ('btn' in $$props) $$invalidate('btn', btn = $$props.btn);
    	};

    	return {
    		table,
    		btn,
    		click,
    		onDockerimgsRefreshed,
    		button_binding
    	};
    }

    class Save extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, ["table", "btn"]);
    	}

    	get table() {
    		throw new Error_1$1("<Save>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error_1$1("<Save>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get btn() {
    		throw new Error_1$1("<Save>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btn(value) {
    		throw new Error_1$1("<Save>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Load.svelte generated by Svelte v3.6.8 */
    const { Error: Error_1$2, console: console_1$2 } = globals;

    const file$3 = "src/Load.svelte";

    function create_fragment$3(ctx) {
    	var button, t_1, input_1, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Load";
    			t_1 = space();
    			input_1 = element("input");
    			attr(button, "class", "svelte-1fdgkab");
    			add_location(button, file$3, 99, 0, 1791);
    			attr(input_1, "type", "file");
    			attr(input_1, "accept", ".tar");
    			input_1.multiple = true;
    			attr(input_1, "class", "svelte-1fdgkab");
    			add_location(input_1, file$3, 106, 0, 1879);

    			dispose = [
    				listen(button, "click", ctx.click_handler),
    				listen(input_1, "change", ctx.onChange)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			ctx.button_binding(button);
    			insert(target, t_1, anchor);
    			insert(target, input_1, anchor);
    			ctx.input_1_binding(input_1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			ctx.button_binding(null);

    			if (detaching) {
    				detach(t_1);
    				detach(input_1);
    			}

    			ctx.input_1_binding(null);
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { table = null, input = null, btn = null } = $$props;

      const onChange = event => {
        if (input.files.length == 0) {
          return;
        }

        const forms = [];

        for (const file of input.files) {
          const formData = new FormData();
          formData.append("file", file);
          forms.push(formData);
        }

        isBlocked.set(true);


        Promise.all(
          forms.map(form => {
            return fetch(`/api/load`, {
              method: "POST",
              body: form
            });
          })
        )
          .then(results => {
            for (const res of results) {
              if (res.status != 201) {
                throw new Error(res.status);
              }
            }
          })
          .catch(err => {
            console.warn(err);
            alert("Error load");
          })
          .finally(() => {
            dispatch('dockerimgs:refresh');
          });
      };

    	const writable_props = ['table', 'input', 'btn'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1$2.warn(`<Load> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('btn', btn = $$value);
    		});
    	}

    	function click_handler() {
    	    input.click();
    	  }

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('input', input = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('table' in $$props) $$invalidate('table', table = $$props.table);
    		if ('input' in $$props) $$invalidate('input', input = $$props.input);
    		if ('btn' in $$props) $$invalidate('btn', btn = $$props.btn);
    	};

    	return {
    		table,
    		input,
    		btn,
    		onChange,
    		button_binding,
    		click_handler,
    		input_1_binding
    	};
    }

    class Load extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["table", "input", "btn"]);
    	}

    	get table() {
    		throw new Error_1$2("<Load>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error_1$2("<Load>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error_1$2("<Load>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error_1$2("<Load>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get btn() {
    		throw new Error_1$2("<Load>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btn(value) {
    		throw new Error_1$2("<Load>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CopyUrl.svelte generated by Svelte v3.6.8 */
    const { console: console_1$3 } = globals;

    const file$4 = "src/CopyUrl.svelte";

    function create_fragment$4(ctx) {
    	var button, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Copy URL";
    			attr(button, "class", "svelte-ue6ru0");
    			add_location(button, file$4, 86, 0, 1825);
    			dispose = listen(button, "click", ctx.click);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			ctx.button_binding(button);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			ctx.button_binding(null);
    			dispose();
    		}
    	};
    }

    function copyToClipboard(text) {
      if (window.clipboardData && window.clipboardData.setData) {
        return clipboardData.setData("Text", text);
      } else if (
        document.queryCommandSupported &&
        document.queryCommandSupported("copy")
      ) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          return document.execCommand("copy");
        } catch (ex) {
          console.warn("Copy to clipboard failed.", ex);
          return false;
        } finally {
          document.body.removeChild(textarea);
        }
      }
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { table = null, btn = null } = $$props;

      const click = () => {
        const actives = [...table.querySelectorAll("tr.active")];
        let url = `${location}?${actives
      .map(row => {
        return `row=${row.id}`;
      })
      .join("&")}`;
        if (actives.length > 0) {
          url += "&save=1";
        }

        copyToClipboard(url);
      };

    	const writable_props = ['table', 'btn'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1$3.warn(`<CopyUrl> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('btn', btn = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('table' in $$props) $$invalidate('table', table = $$props.table);
    		if ('btn' in $$props) $$invalidate('btn', btn = $$props.btn);
    	};

    	return { table, btn, click, button_binding };
    }

    class CopyUrl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["table", "btn"]);
    	}

    	get table() {
    		throw new Error("<CopyUrl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error("<CopyUrl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get btn() {
    		throw new Error("<CopyUrl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btn(value) {
    		throw new Error("<CopyUrl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Blocker.svelte generated by Svelte v3.6.8 */

    const file$5 = "src/Blocker.svelte";

    function create_fragment$5(ctx) {
    	var div, svg, g, linearGradient0, stop0, stop1, linearGradient1, stop2, stop3, path0, path1, animateTransform;

    	return {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			animateTransform = svg_element("animateTransform");
    			attr(stop0, "offset", "0%");
    			attr(stop0, "stop-color", "#2696ec");
    			add_location(stop0, file$5, 91, 250, 1589);
    			attr(stop1, "offset", "100%");
    			attr(stop1, "stop-color", "#86c5f4");
    			add_location(stop1, file$5, 91, 290, 1629);
    			attr(linearGradient0, "id", "linear-gradient");
    			add_location(linearGradient0, file$5, 91, 213, 1552);
    			attr(stop2, "offset", "0%");
    			attr(stop2, "stop-color", "#2696ec");
    			add_location(stop2, file$5, 91, 387, 1726);
    			attr(stop3, "offset", "100%");
    			attr(stop3, "stop-color", "#d6ebfb");
    			add_location(stop3, file$5, 91, 427, 1766);
    			attr(linearGradient1, "id", "linear-gradient2");
    			add_location(linearGradient1, file$5, 91, 349, 1688);
    			attr(path0, "d", "M64 .98A63.02 63.02 0 1 1 .98 64 63.02 63.02 0 0 1 64 .98zm0 15.76A47.26 47.26 0 1 1 16.74 64 47.26 47.26 0 0 1 64 16.74z");
    			attr(path0, "fill-rule", "evenodd");
    			attr(path0, "fill", "url(#linear-gradient)");
    			add_location(path0, file$5, 91, 486, 1825);
    			attr(path1, "d", "M64.12 125.54A61.54 61.54 0 1 1 125.66 64a61.54 61.54 0 0 1-61.54 61.54zm0-121.1A59.57 59.57 0 1 0 123.7 64 59.57 59.57 0 0 0 64.1 4.43zM64 115.56a51.7 51.7 0 1 1 51.7-51.7 51.7 51.7 0 0 1-51.7 51.7zM64 14.4a49.48 49.48 0 1 0 49.48 49.48A49.48 49.48 0 0 0 64 14.4z");
    			attr(path1, "fill-rule", "evenodd");
    			attr(path1, "fill", "url(#linear-gradient2)");
    			add_location(path1, file$5, 91, 668, 2007);
    			attr(animateTransform, "attributeName", "transform");
    			attr(animateTransform, "type", "rotate");
    			attr(animateTransform, "from", "0 64 64");
    			attr(animateTransform, "to", "360 64 64");
    			attr(animateTransform, "dur", "1800ms");
    			attr(animateTransform, "repeatCount", "indefinite");
    			add_location(animateTransform, file$5, 91, 994, 2333);
    			add_location(g, file$5, 91, 210, 1549);
    			attr(svg, "xmlns:svg", "http://www.w3.org/2000/svg");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr(svg, "version", "1.0");
    			attr(svg, "width", "64px");
    			attr(svg, "height", "64px");
    			attr(svg, "viewBox", "0 0 128 128");
    			attr(svg, "xml:space", "preserve");
    			attr(svg, "class", "svelte-nwg5vn");
    			add_location(svg, file$5, 91, 4, 1343);
    			attr(div, "class", "svelte-nwg5vn");
    			toggle_class(div, "show", ctx.isBlockedVal);
    			add_location(div, file$5, 90, 0, 1307);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, svg);
    			append(svg, g);
    			append(g, linearGradient0);
    			append(linearGradient0, stop0);
    			append(linearGradient0, stop1);
    			append(g, linearGradient1);
    			append(linearGradient1, stop2);
    			append(linearGradient1, stop3);
    			append(g, path0);
    			append(g, path1);
    			append(g, animateTransform);
    		},

    		p: function update(changed, ctx) {
    			if (changed.isBlockedVal) {
    				toggle_class(div, "show", ctx.isBlockedVal);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let isBlockedVal = false;
      const unsubscribe = isBlocked.subscribe(value => {
        $$invalidate('isBlockedVal', isBlockedVal = value);
      });

    	return { isBlockedVal };
    }

    class Blocker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.6.8 */

    const file$6 = "src/App.svelte";

    function create_fragment$6(ctx) {
    	var div1, t0, section, updating_table, t1, div0, t2, t3, t4, current;

    	var header = new Header({ $$inline: true });

    	function dockerimgs_table_binding(value) {
    		ctx.dockerimgs_table_binding.call(null, value);
    		updating_table = true;
    		add_flush_callback(() => updating_table = false);
    	}

    	let dockerimgs_props = {};
    	if (ctx.table !== void 0) {
    		dockerimgs_props.table = ctx.table;
    	}
    	var dockerimgs = new DockerImgs({ props: dockerimgs_props, $$inline: true });

    	binding_callbacks.push(() => bind(dockerimgs, 'table', dockerimgs_table_binding));

    	var copyurl = new CopyUrl({
    		props: { table: ctx.table },
    		$$inline: true
    	});

    	var load = new Load({
    		props: { table: ctx.table },
    		$$inline: true
    	});

    	var save = new Save({
    		props: { table: ctx.table },
    		$$inline: true
    	});

    	var blocker = new Blocker({ $$inline: true });

    	return {
    		c: function create() {
    			div1 = element("div");
    			header.$$.fragment.c();
    			t0 = space();
    			section = element("section");
    			dockerimgs.$$.fragment.c();
    			t1 = space();
    			div0 = element("div");
    			copyurl.$$.fragment.c();
    			t2 = space();
    			load.$$.fragment.c();
    			t3 = space();
    			save.$$.fragment.c();
    			t4 = space();
    			blocker.$$.fragment.c();
    			attr(section, "class", "svelte-1gjrln7");
    			add_location(section, file$6, 51, 2, 857);
    			attr(div0, "class", "sticky svelte-1gjrln7");
    			add_location(div0, file$6, 55, 2, 913);
    			attr(div1, "class", "page svelte-1gjrln7");
    			add_location(div1, file$6, 49, 0, 823);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			mount_component(header, div1, null);
    			append(div1, t0);
    			append(div1, section);
    			mount_component(dockerimgs, section, null);
    			append(div1, t1);
    			append(div1, div0);
    			mount_component(copyurl, div0, null);
    			append(div0, t2);
    			mount_component(load, div0, null);
    			append(div0, t3);
    			mount_component(save, div0, null);
    			append(div1, t4);
    			mount_component(blocker, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var dockerimgs_changes = {};
    			if (!updating_table && changed.table) {
    				dockerimgs_changes.table = ctx.table;
    			}
    			dockerimgs.$set(dockerimgs_changes);

    			var copyurl_changes = {};
    			if (changed.table) copyurl_changes.table = ctx.table;
    			copyurl.$set(copyurl_changes);

    			var load_changes = {};
    			if (changed.table) load_changes.table = ctx.table;
    			load.$set(load_changes);

    			var save_changes = {};
    			if (changed.table) save_changes.table = ctx.table;
    			save.$set(save_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(dockerimgs.$$.fragment, local);

    			transition_in(copyurl.$$.fragment, local);

    			transition_in(load.$$.fragment, local);

    			transition_in(save.$$.fragment, local);

    			transition_in(blocker.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(dockerimgs.$$.fragment, local);
    			transition_out(copyurl.$$.fragment, local);
    			transition_out(load.$$.fragment, local);
    			transition_out(save.$$.fragment, local);
    			transition_out(blocker.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_component(header);

    			destroy_component(dockerimgs);

    			destroy_component(copyurl);

    			destroy_component(load);

    			destroy_component(save);

    			destroy_component(blocker);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

      let { table = null } = $$props;

    	const writable_props = ['table'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function dockerimgs_table_binding(value) {
    		table = value;
    		$$invalidate('table', table);
    	}

    	$$self.$set = $$props => {
    		if ('table' in $$props) $$invalidate('table', table = $$props.table);
    	};

    	return { table, dockerimgs_table_binding };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, ["table"]);
    	}

    	get table() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
