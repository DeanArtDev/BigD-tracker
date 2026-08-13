import type { EditorThemeClasses } from 'lexical';

export const commonTheme: EditorThemeClasses = {
  autocomplete: 'PlaygroundEditorTheme__autocomplete',
  blockCursor: 'PlaygroundEditorTheme__blockCursor',
  characterLimit: 'PlaygroundEditorTheme__characterLimit',
  code: 'PlaygroundEditorTheme__code',
  codeHighlight: {
    atrule: 'PlaygroundEditorTheme__tokenAttr',
    attr: 'PlaygroundEditorTheme__tokenAttr',
    boolean: 'PlaygroundEditorTheme__tokenProperty',
    builtin: 'PlaygroundEditorTheme__tokenSelector',
    cdata: 'PlaygroundEditorTheme__tokenComment',
    char: 'PlaygroundEditorTheme__tokenSelector',
    class: 'PlaygroundEditorTheme__tokenFunction',
    'class-name': 'PlaygroundEditorTheme__tokenFunction',
    comment: 'PlaygroundEditorTheme__tokenComment',
    constant: 'PlaygroundEditorTheme__tokenProperty',
    deleted: 'PlaygroundEditorTheme__tokenDeleted',
    doctype: 'PlaygroundEditorTheme__tokenComment',
    entity: 'PlaygroundEditorTheme__tokenOperator',
    function: 'PlaygroundEditorTheme__tokenFunction',
    important: 'PlaygroundEditorTheme__tokenVariable',
    inserted: 'PlaygroundEditorTheme__tokenInserted',
    keyword: 'PlaygroundEditorTheme__tokenAttr',
    namespace: 'PlaygroundEditorTheme__tokenVariable',
    number: 'PlaygroundEditorTheme__tokenProperty',
    operator: 'PlaygroundEditorTheme__tokenOperator',
    prolog: 'PlaygroundEditorTheme__tokenComment',
    property: 'PlaygroundEditorTheme__tokenProperty',
    punctuation: 'PlaygroundEditorTheme__tokenPunctuation',
    regex: 'PlaygroundEditorTheme__tokenVariable',
    selector: 'PlaygroundEditorTheme__tokenSelector',
    string: 'PlaygroundEditorTheme__tokenSelector',
    symbol: 'PlaygroundEditorTheme__tokenProperty',
    tag: 'PlaygroundEditorTheme__tokenProperty',
    unchanged: 'PlaygroundEditorTheme__tokenUnchanged',
    url: 'PlaygroundEditorTheme__tokenOperator',
    variable: 'PlaygroundEditorTheme__tokenVariable',
  },
  embedBlock: {
    base: 'PlaygroundEditorTheme__embedBlock',
    focus: 'PlaygroundEditorTheme__embedBlockFocus',
  },
  hashtag: 'PlaygroundEditorTheme__hashtag',
  heading: {
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-4',
    h2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 mb-3',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight mb-2',
    h4: 'scroll-m-20 text-xl font-semibold tracking-tight mb-1',
    h5: 'PlaygroundEditorTheme__h5',
    h6: 'PlaygroundEditorTheme__h6',
  },
  hr: "border-none before:content-[''] p-0.5 my-4 before:bg-gray-300 before:h-[2px] before:rounded-lg before:block",
  hrSelected: 'PlaygroundEditorTheme__hrSelected',
  image: 'editor-image',
  indent: 'PlaygroundEditorTheme__indent',
  layoutContainer: 'PlaygroundEditorTheme__layoutContainer',
  layoutItem: 'PlaygroundEditorTheme__layoutItem',
  link: 'PlaygroundEditorTheme__link',

  list: {
    checklist: 'checklist p-0 list-none',

    listitem:
      'listitem relative min-h-7 ' +
      '[&[role=checkbox]]:flex flex-col justify-center ' +
      'group-[&[contenteditable=true]]/content-editable:before:cursor-pointer',

    listitemUnchecked:
      'checklist:flex checklist:pl-8 ' +
      "before:content-[''] before:absolute before:left-0 before:top-[2px] " +
      'before:size-6 before:shrink-0 before:rounded-[6px] before:border before:border-input ' +
      'before:bg-background dark:before:bg-input/30 before:shadow-xs',

    listitemChecked:
      'checklist:flex checklist:pl-8 line-through ' +
      "before:content-[''] before:absolute before:left-0 before:top-[2px] " +
      'before:size-6 before:shrink-0 before:rounded-[6px] before:border before:border-primary ' +
      'before:bg-primary before:shadow-xs ' +
      "after:content-[''] after:absolute after:left-2 after:top-1.5 " +
      'after:h-[0.9rem] after:w-[0.45rem] after:rotate-45 ' +
      'after:border-r-[3px] after:border-b-[3px] after:border-primary-foreground',

    ul:
      'my-2 pl-6 list-disc ' +
      '[&.checklist]:pl-0 ' +
      '[&.checklist>.listitem]:pl-8 ' +
      '[&:not(.checklist)>.listitem]:list-item ' +
      '[&:not(.checklist)>.listitem]:pl-0 ' +
      '[&:not(.checklist)>.listitem]:flex-none ' +
      '[&:not(.checklist)>.listitem]:leading-7',

    ol:
      'my-2 pl-6 list-decimal ' +
      '[&:not(.checklist)>.listitem]:list-item ' +
      '[&:not(.checklist)>.listitem]:pl-0 ' +
      '[&:not(.checklist)>.listitem]:flex-none ' +
      '[&:not(.checklist)>.listitem]:leading-7',

    nested: {
      listitem: 'my-1',
    },

    // глубины для ol (Lexical сам навесит соответствующий класс)
    olDepth: ['list-decimal', 'list-decimal', 'list-decimal', 'list-decimal', 'list-decimal'],
  },

  checklist: {},

  mark: 'PlaygroundEditorTheme__mark',
  markOverlap: 'PlaygroundEditorTheme__markOverlap',
  paragraph: 'leading-7 [&:not(:first-child)]:mt-2',
  quote: 'PlaygroundEditorTheme__quote',
  specialText: 'PlaygroundEditorTheme__specialText',
  tab: 'PlaygroundEditorTheme__tabNode',
  table: 'PlaygroundEditorTheme__table',
  tableAddColumns: 'PlaygroundEditorTheme__tableAddColumns',
  tableAddRows: 'PlaygroundEditorTheme__tableAddRows',
  tableAlignment: {
    center: 'PlaygroundEditorTheme__tableAlignmentCenter',
    right: 'PlaygroundEditorTheme__tableAlignmentRight',
  },
  tableCell: 'PlaygroundEditorTheme__tableCell',
  tableCellActionButton: 'PlaygroundEditorTheme__tableCellActionButton',
  tableCellActionButtonContainer: 'PlaygroundEditorTheme__tableCellActionButtonContainer',
  tableCellHeader: 'PlaygroundEditorTheme__tableCellHeader',
  tableCellResizer: 'PlaygroundEditorTheme__tableCellResizer',
  tableCellSelected: 'PlaygroundEditorTheme__tableCellSelected',
  tableFrozenColumn: 'PlaygroundEditorTheme__tableFrozenColumn',
  tableFrozenRow: 'PlaygroundEditorTheme__tableFrozenRow',
  tableRowStriping: 'PlaygroundEditorTheme__tableRowStriping',
  tableScrollableWrapper: 'PlaygroundEditorTheme__tableScrollableWrapper',
  tableSelected: 'PlaygroundEditorTheme__tableSelected',
  tableSelection: 'PlaygroundEditorTheme__tableSelection',
  text: {
    bold: 'font-semibold',
    capitalize: 'capitalize',
    code: 'PlaygroundEditorTheme__textCode',
    highlight: 'PlaygroundEditorTheme__textHighlight',
    italic: 'italic',
    lowercase: 'lowercase',
    strikethrough: 'line-through',
    subscript: 'PlaygroundEditorTheme__textSubscript',
    superscript: 'PlaygroundEditorTheme__textSuperscript',
    underline: 'underline',
    underlineStrikethrough: 'line-through',
    uppercase: 'uppercase',
  },
};
