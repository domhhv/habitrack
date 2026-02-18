import { cn, Textarea } from '@heroui/react';
import React from 'react';

// CSS properties that affect textarea height — mirrors react-textarea-autosize's sizing model
const SIZING_STYLE_KEYS = [
  'border-bottom-width',
  'border-top-width',
  'box-sizing',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'line-height',
  'padding-bottom',
  'padding-top',
  'tab-size',
  'text-indent',
  'text-rendering',
  'text-transform',
  'width',
  'word-break',
  'word-spacing',
];

// Styles applied to the hidden measurement textarea
const HIDDEN_TEXTAREA_STYLES = [
  'min-height:0',
  'max-height:none',
  'height:0',
  'visibility:hidden',
  'overflow:hidden',
  'position:absolute',
  'z-index:-1000',
  'top:0',
  'right:0',
  'display:block',
].join(';');

// Singleton hidden textarea used for height measurements
let hiddenTextarea: HTMLTextAreaElement | null = null;

const getHiddenTextarea = (): HTMLTextAreaElement => {
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.setAttribute('tabindex', '-1');
    hiddenTextarea.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hiddenTextarea);
  }

  return hiddenTextarea;
};

const computeHeight = (
  node: HTMLTextAreaElement,
  minRows: number,
  maxRows: number
): { height: number; isAtMax: boolean } => {
  const computed = window.getComputedStyle(node);
  const hidden = getHiddenTextarea();

  // Copy all sizing-relevant styles to the hidden textarea so it renders identically
  const sizingStyle = SIZING_STYLE_KEYS.map((key) => {
    return `${key}:${computed.getPropertyValue(key)}`;
  }).join(';');
  hidden.setAttribute('style', `${sizingStyle};${HIDDEN_TEXTAREA_STYLES}`);

  const paddingSize =
    parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
  const borderSize =
    parseFloat(computed.borderTopWidth) +
    parseFloat(computed.borderBottomWidth);
  const isBorderBox = computed.boxSizing === 'border-box';

  // Measure a single row's pixel height
  hidden.value = 'x';
  const rowHeight = hidden.scrollHeight - paddingSize;

  // Measure the content height; value set twice as a Firefox bug workaround
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1795904
  const content = node.value || node.placeholder || 'x';
  hidden.value = content;
  hidden.value = content;

  let contentHeight = hidden.scrollHeight;

  if (isBorderBox) {
    contentHeight += borderSize;
  } else {
    contentHeight -= paddingSize;
  }

  // Min/max heights in the same box model as contentHeight
  const boxAdjust = isBorderBox ? paddingSize + borderSize : 0;
  const minHeight = rowHeight * minRows + boxAdjust;
  const maxHeight = rowHeight * maxRows + boxAdjust;
  const height = Math.max(minHeight, Math.min(maxHeight, contentHeight));

  return { height, isAtMax: height >= maxHeight && contentHeight > maxHeight };
};

type AutoResizableTextareaProps = Omit<
  React.ComponentProps<typeof Textarea>,
  'disableAutosize' | 'minRows' | 'maxRows'
> & {
  /**
   * Rows to display when the textarea is empty (before the user types).
   * Useful for giving a textarea a generous initial size that then shrinks to
   * minRows once content is present. Defaults to minRows.
   */
  initialRows?: number;
  /** Maximum number of rows before overflow scrolls. Defaults to 8. */
  maxRows?: number;
  /** Minimum number of visible rows (floor for auto-resize). Defaults to 3. */
  minRows?: number;
};

const AutoResizableTextarea = ({
  classNames,
  initialRows,
  maxRows = 8,
  minRows = 3,
  onChange,
  ...props
}: AutoResizableTextareaProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const node = textareaRef.current;

    if (!node) {
      return;
    }

    // When the field is empty, honour initialRows for the initial visual size
    const effectiveMinRows = Math.min(
      !node.value && initialRows != null ? initialRows : minRows,
      maxRows
    );

    const { height, isAtMax } = computeHeight(node, effectiveMinRows, maxRows);
    node.style.height = `${height}px`;
    // Hide overflow when content fits (prevents scrollbar flash while typing);
    // show it when capped at maxRows so content remains accessible
    node.style.overflowY = isAtMax ? 'auto' : 'hidden';
  }, [minRows, maxRows, initialRows]);

  // Resize synchronously after every render that changes the controlled value
  React.useLayoutEffect(() => {
    resize();
  }, [resize, props.value]);

  // Resize on window resize (width changes alter line wrapping)
  React.useEffect(() => {
    window.addEventListener('resize', resize);

    return () => {
      return window.removeEventListener('resize', resize);
    };
  }, [resize]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);

      // Uncontrolled mode: no parent re-render drives useLayoutEffect,
      // so we resize eagerly on each change event
      if (props.value === undefined) {
        resize();
      }
    },
    [onChange, props.value, resize]
  );

  return (
    <Textarea
      {...props}
      disableAutosize
      ref={textareaRef}
      onChange={handleChange}
      classNames={{
        ...classNames,
        // resize-y exposes the native browser drag handle for manual resizing
        input: cn('resize-y', classNames?.input),
      }}
    />
  );
};

export default AutoResizableTextarea;
