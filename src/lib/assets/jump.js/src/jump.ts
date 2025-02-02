import easeInOutQuad from './easing.js'

interface JumpOptions {
  duration?: number | ((distance: number) => number)
  offset?: number
  callback?: () => void
  easing?: (t: number, b: number, c: number, d: number) => number
  a11y?: boolean
  container?: Element | string
}

export const createJump = () => {
  // private variable cache
  // no variables are created during a jump, preventing memory leaks

  let container // container element to be scrolled       (node)
  let element // element to scroll to                   (node)

  let start // where scroll starts                    (px)
  let stop // where scroll stops                     (px)

  let offset // adjustment from the stop position      (px)
  let easing // easing function                        (function)
  let a11y // accessibility support flag             (boolean)

  let distance // distance of scroll                     (px)
  let duration // scroll duration                        (ms)

  let timeStart // time scroll started                    (ms)
  let timeElapsed // time spent scrolling thus far          (ms)

  let next // next scroll position                   (px)

  let callback // to call when done scrolling            (function)

  let scrolling // true whilst scrolling                  (boolean)

  // scroll position helper

  function location() {
    return container.scrollY || container.pageYOffset || container.scrollTop
  }

  // element offset helper

  function top(element) {
    const elementTop = element.getBoundingClientRect().top
    const containerTop = container.getBoundingClientRect ? container.getBoundingClientRect().top : 0

    return elementTop - containerTop + start
  }

  // scrollTo helper

  function scrollTo(top) {
    container.scrollTo
      ? container.scrollTo(container.scrollLeft, top) // window
      : (container.scrollTop = top) // custom container
  }

  // rAF loop helper

  function loop(timeCurrent) {
    // store time scroll started, if not started already
    if (!timeStart) {
      timeStart = timeCurrent
    }

    // determine time spent scrolling so far
    timeElapsed = timeCurrent - timeStart

    // calculate next scroll position
    next = easing(timeElapsed, start, distance, duration)

    // scroll to it
    scrollTo(next)

    scrolling = true

    // check progress
    timeElapsed < duration
      ? requestAnimationFrame(loop) // continue scroll loop
      : done() // scrolling is done
  }

  // scroll finished helper

  function done() {
    // account for rAF time rounding inaccuracies
    scrollTo(start + distance)

    // if scrolling to an element, and accessibility is enabled
    if (element && a11y) {
      // add tabindex indicating programmatic focus
      element.setAttribute('tabindex', '-1')

      // focus the element
      element.focus()
    }

    // if it exists, fire the callback
    if (typeof callback === 'function') {
      callback()
    }

    // reset time for next jump
    timeStart = false

    // we're done scrolling
    scrolling = false
  }

  // API

  function jump(target: Element, options: JumpOptions = {}) {
    // resolve options, or use defaults
    duration = options.duration || 1000
    offset = options.offset || 0
    callback = options.callback // "undefined" is a suitable default, and won't be called
    easing = options.easing || easeInOutQuad
    a11y = options.a11y || false

    // resolve container
    switch (typeof options.container) {
      case 'object':
        // we assume container is an HTML element (Node)
        container = options.container
        break

      case 'string':
        container = document.querySelector(options.container)
        break

      default:
        container = window
    }

    // cache starting position
    start = location()

    // resolve target
    switch (typeof target) {
      // scroll from current position
      case 'number':
        element = undefined // no element to scroll to
        a11y = false // make sure accessibility is off
        stop = start + target
        break

      // scroll to element (node)
      // bounding rect is relative to the viewport
      case 'object':
        element = target
        stop = top(element)
        break

      // scroll to element (selector)
      // bounding rect is relative to the viewport
      case 'string':
        element = document.querySelector(target)
        stop = top(element)
        break

      default:
    }

    // resolve scroll distance, accounting for offset
    distance = stop - start + offset

    // resolve duration
    switch (typeof options.duration) {
      // number in ms
      case 'number':
        duration = options.duration
        break

      // function passed the distance of the scroll
      case 'function':
        duration = options.duration(distance)
        break

      default:
    }

    // start the loop if we're not already scrolling
    if (!scrolling) {
      requestAnimationFrame(loop)
    } else {
      // reset time for next jump
      timeStart = false
    }
  }

  // expose only the jump method
  return jump
}

// export singleton

const singleton = createJump()

export default singleton
