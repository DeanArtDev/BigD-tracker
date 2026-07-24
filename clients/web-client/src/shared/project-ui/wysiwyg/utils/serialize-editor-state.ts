import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, type EditorState, type LexicalNode } from 'lexical';

function hasContent(node: LexicalNode): boolean {
  if ($isTextNode(node)) {
    return node.getTextContent().trim().length > 0;
  }

  if ($isDecoratorNode(node)) {
    return true;
  }

  if ($isElementNode(node)) {
    return node.getChildren().some(hasContent);
  }

  return node.getTextContent().trim().length > 0;
}

function serializeEditorState(editorState: EditorState): string | undefined {
  const isEmpty = editorState.read(() => !$getRoot().getChildren().some(hasContent));

  return isEmpty ? undefined : JSON.stringify(editorState.toJSON());
}

export { serializeEditorState };
