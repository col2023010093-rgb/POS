import { useState, useEffect, useCallback, useRef } from 'react'

// Main hook for menu animations
export const useMenuAnimation = (delay = 100) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [animatedItems, setAnimatedItems] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const triggerItemAnimation = useCallback((itemCount) => {
    setAnimatedItems([])
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setAnimatedItems(prev => [...prev, i])
      }, i * 80)
    }
  }, [])

  return { isLoaded, animatedItems, triggerItemAnimation }
}

// Hook for staggered animations
export const useStaggerAnimation = (items, staggerDelay = 100) => {
  const [visibleItems, setVisibleItems] = useState([])

  useEffect(() => {
    setVisibleItems([])
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index])
      }, index * staggerDelay)
    })
  }, [items, staggerDelay])

  const isVisible = (index) => visibleItems.includes(index)
  const getDelay = (index) => `${index * staggerDelay}ms`

  return { isVisible, getDelay, visibleItems }
}

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return { ref, isVisible }
}

// Hook for modal animations
export const useModalAnimation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const openModal = useCallback(() => {
    setIsAnimating(true)
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      setIsAnimating(false)
      document.body.style.overflow = 'auto'
    }, 300)
  }, [])

  const modalClasses = {
    overlay: `modal-overlay ${isOpen && !isClosing ? 'active' : ''} ${isClosing ? 'closing' : ''}`,
    container: `modal-container ${isOpen && !isClosing ? 'active' : ''} ${isClosing ? 'closing' : ''}`
  }

  return { isOpen, isClosing, isAnimating, openModal, closeModal, modalClasses }
}

// Hook for cart animations
export const useCartAnimation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [itemAdded, setItemAdded] = useState(false)
  const [addedItemId, setAddedItemId] = useState(null)

  const openCart = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const triggerAddAnimation = useCallback((itemId) => {
    setItemAdded(true)
    setAddedItemId(itemId)
    setTimeout(() => {
      setItemAdded(false)
      setAddedItemId(null)
    }, 600)
  }, [])

  return { 
    isOpen, 
    itemAdded, 
    addedItemId, 
    openCart, 
    closeCart, 
    toggleCart, 
    triggerAddAnimation 
  }
}

// Hook for hover animations
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = useCallback((e) => {
    setIsHovered(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (isHovered) {
      const rect = e.currentTarget.getBoundingClientRect()
      setHoverPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [isHovered])

  return { 
    isHovered, 
    hoverPosition, 
    handleMouseEnter, 
    handleMouseLeave, 
    handleMouseMove 
  }
}

// Hook for pulse animation on cart count
export const usePulseAnimation = (trigger) => {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (trigger > 0) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 300)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return isPulsing
}

// Hook for category tab animations
export const useCategoryAnimation = (activeCategory) => {
  const [previousCategory, setPreviousCategory] = useState(activeCategory)
  const [direction, setDirection] = useState('none')

  useEffect(() => {
    if (activeCategory !== previousCategory) {
      // Determine animation direction based on category order
      setDirection('fade')
      setPreviousCategory(activeCategory)
    }
  }, [activeCategory, previousCategory])

  return { direction }
}

// Utility function for animation delays
export const getAnimationDelay = (index, baseDelay = 0.08) => {
  return { animationDelay: `${index * baseDelay}s` }
}

// Utility function for stagger styles
export const getStaggerStyles = (index, baseDelay = 100) => {
  return {
    animationDelay: `${index * baseDelay}ms`,
    transitionDelay: `${index * baseDelay}ms`
  }
}

export default useMenuAnimation