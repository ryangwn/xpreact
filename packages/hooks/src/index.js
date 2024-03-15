import { options } from 'xpreact'

/** @type {number} */
let currentIndex;

let currentComponent;

let currentHook = 0;

let EMPTY = [];

options._render = vnode => {
	currentComponent = vnode._component;
	currentIndex = 0;

  const hooks = currentComponent.__hooks;
  if (hooks) {
    
  }
}

export function useState(initialState) {
  return useReducer(invokeOrReturn, initialState)
}

export function useReducer(reducer, initialState, init) {
  const hookState = getHookState(currentIndex++)

  hookState._reducer = reducer
  
  if (!hookState._component) {
    hookState._value = [
      !init ? invokeOrReturn(undefined, initialState) : init(initialState),

      action => {
        const currentValue = hookState._nextValue
          ? hookState._nextValue[0]
          : hookState._value[0]

        const nextValue = hookState._reducer(currentValue, action)

        if (currentValue !== nextValue) {
          hookState._nextValue = [nextValue, hookState._value[1]];
          hookState._component.setState({});
        }
      }
    ]

    hookState._component = currentComponent
  }

  return hookState._nextValue || hookState._value
}

export function useEffect(callback, args) {
  const state = getHookState(currentIndex++, 3);

  if (!options._skipEffects && argsChanged(state._args, args)) {
    state._value = callback;
    state._pendingArgs = args;

    currentComponent.__hooks._pendingEffects.push(state);
  }
}

export function useLayoutEffects(callback, args) {
  const state = getHookState(currentIndex++, 4);

  if (!options._skipEffects && argsChanged(state._args, args)) {
    state._value = callback;
    state._pendingArgs = args;

    currentComponent._renderCallbacks.push(state);
  }
}

/** @type {(initialvalue: unknown) => unknown} */
export function useRef(initialValue) {
  currentHook = 5;

  return useMemo(() => ({ current: initialValue }), [])
}


export function useMemo(factory, args) {
  const state = getHookState(currentIndex++, 7)

  if (argsChanged(state._args, args)) {
    state._pendingValue = factory();
    state._pendingArgs = args;
    state._factory = factory;

    return state._pendingValue;
  }
}

/**
 * @param {() => void} callback 
 * @param {unknown[]} args 
 * @returns {() => void}
 */
export function useCallback(callback, args) {
  currentHook = 8;
  return useMemo(() => callback, args);
}

export function getHookState(index) {
  currentHook = 0;

  const hooks =
    currentComponent.__hooks ||
    (currentComponent.__hooks = {
      _list: [],
      _pendingEffects: []
    })

  if (index >= hooks._list.length) {
    hooks._list.push({ _pendingValue: EMPTY })
  }

  return hooks._list[index];
}

/**
 * 
 * @param {unknown[]} oldArgs 
 * @param {unknown} newArgs 
 * @returns {boolean}
 */
function argsChanged(oldArgs, newArgs) {
  return (
    !oldArgs ||
    oldArgs.length !== newArgs.length ||
    newArgs.some((arg, index) => arg !== oldArgs[index])
  )
}

/**
 * @template Arg
 * @param {Arg} arg
 * @param {(arg: Arg) => any} f
 * @returns {any}
 */
function invokeOrReturn(arg, f) {
  return typeof f == 'function' ? f(arg) : f;
}
