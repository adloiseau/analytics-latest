import { useState, useEffect, useCallback } from 'react';

interface PopupPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
  maxHeight?: string;
  maxWidth?: string;
}

interface UseSmartPopupPositionOptions {
  triggerElement?: HTMLElement | null;
  popupHeight?: number;
  popupWidth?: number;
  offset?: number;
}

export const useSmartPopupPosition = (options: UseSmartPopupPositionOptions = {}) => {
  const { triggerElement, popupHeight = 600, popupWidth = 800, offset = 20 } = options;
  const [position, setPosition] = useState<PopupPosition>({});

  const calculatePosition = useCallback(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY,
      scrollX: window.scrollX
    };

    // Calculer les dimensions maximales disponibles
    const maxAvailableWidth = viewport.width - (offset * 2);
    const maxAvailableHeight = viewport.height - (offset * 2);
    
    // Ajuster les dimensions de la popup si nécessaire
    const finalWidth = Math.min(popupWidth, maxAvailableWidth);
    const finalHeight = Math.min(popupHeight, maxAvailableHeight);

    let newPosition: PopupPosition = {
      maxWidth: `${finalWidth}px`,
      maxHeight: `${finalHeight}px`
    };

    // Mobile : toujours centrer avec contraintes strictes
    if (viewport.width < 768) {
      newPosition = {
        top: `${offset}px`,
        left: `${offset}px`,
        right: `${offset}px`,
        bottom: `${offset}px`,
        transform: 'none',
        maxHeight: `${viewport.height - (offset * 2)}px`,
        maxWidth: `${viewport.width - (offset * 2)}px`
      };
    } else {
      // Desktop : positionnement intelligent avec contraintes
      if (triggerElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const triggerAbsoluteTop = triggerRect.top + viewport.scrollY;
        const triggerAbsoluteLeft = triggerRect.left + viewport.scrollX;

        // Calculer l'espace disponible dans chaque direction
        const spaceAbove = triggerRect.top;
        const spaceBelow = viewport.height - triggerRect.bottom;
        const spaceLeft = triggerRect.left;
        const spaceRight = viewport.width - triggerRect.right;

        // Position verticale
        if (spaceBelow >= finalHeight + offset) {
          // Assez d'espace en dessous
          newPosition.top = `${triggerAbsoluteTop + triggerRect.height + offset}px`;
        } else if (spaceAbove >= finalHeight + offset) {
          // Assez d'espace au-dessus
          newPosition.bottom = `${viewport.height - triggerAbsoluteTop + offset}px`;
        } else {
          // Pas assez d'espace, centrer verticalement dans le viewport visible
          const visibleTop = viewport.scrollY + offset;
          newPosition.top = `${visibleTop}px`;
          newPosition.maxHeight = `${viewport.height - (offset * 2)}px`;
        }

        // Position horizontale
        if (spaceRight >= finalWidth + offset) {
          // Assez d'espace à droite
          newPosition.left = `${Math.max(offset, triggerAbsoluteLeft)}px`;
        } else if (spaceLeft >= finalWidth + offset) {
          // Assez d'espace à gauche
          newPosition.right = `${Math.max(offset, viewport.width - (triggerAbsoluteLeft + triggerRect.width))}px`;
        } else {
          // Pas assez d'espace, centrer horizontalement dans le viewport visible
          const visibleLeft = viewport.scrollX + offset;
          newPosition.left = `${visibleLeft}px`;
          newPosition.maxWidth = `${viewport.width - (offset * 2)}px`;
        }

        // S'assurer que la popup reste dans les limites du viewport
        if (newPosition.left && parseInt(newPosition.left) + finalWidth > viewport.width + viewport.scrollX) {
          newPosition.left = `${viewport.scrollX + viewport.width - finalWidth - offset}px`;
        }
        
        if (newPosition.top && parseInt(newPosition.top) + finalHeight > viewport.height + viewport.scrollY) {
          newPosition.top = `${viewport.scrollY + viewport.height - finalHeight - offset}px`;
        }

        // Contraintes minimales
        if (newPosition.left && parseInt(newPosition.left) < viewport.scrollX + offset) {
          newPosition.left = `${viewport.scrollX + offset}px`;
        }
        
        if (newPosition.top && parseInt(newPosition.top) < viewport.scrollY + offset) {
          newPosition.top = `${viewport.scrollY + offset}px`;
        }

      } else {
        // Pas d'élément déclencheur : centrer dans le viewport visible
        const visibleCenterX = viewport.scrollX + (viewport.width / 2);
        const visibleCenterY = viewport.scrollY + (viewport.height / 2);
        
        newPosition = {
          left: `${Math.max(offset, visibleCenterX - (finalWidth / 2))}px`,
          top: `${Math.max(offset, visibleCenterY - (finalHeight / 2))}px`,
          maxWidth: `${finalWidth}px`,
          maxHeight: `${finalHeight}px`,
          transform: 'none'
        };

        // Vérifier les limites
        const leftPos = parseInt(newPosition.left);
        const topPos = parseInt(newPosition.top);
        
        if (leftPos + finalWidth > viewport.scrollX + viewport.width) {
          newPosition.left = `${viewport.scrollX + viewport.width - finalWidth - offset}px`;
        }
        
        if (topPos + finalHeight > viewport.scrollY + viewport.height) {
          newPosition.top = `${viewport.scrollY + viewport.height - finalHeight - offset}px`;
        }
      }
    }

    setPosition(newPosition);
  }, [triggerElement, popupHeight, popupWidth, offset]);

  useEffect(() => {
    calculatePosition();

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [calculatePosition]);

  return position;
};