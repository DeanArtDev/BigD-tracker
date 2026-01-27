import { FORMAT_TEXT_COMMAND, type TextFormatType, type LexicalEditor } from 'lexical';

const dispatchFormatTextCommand = (editor: LexicalEditor, payload: TextFormatType) =>
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, payload);

export { dispatchFormatTextCommand };
