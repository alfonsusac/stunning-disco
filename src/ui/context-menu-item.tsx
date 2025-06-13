import type { ComponentProps } from "react"
 

function ContextMenuItemButton(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`p-1 px-2 hover:bg-blue-500/50 rounded-sm w-full 
      flex text-start ${ props.className || "" }`}
    />
  )
}

export const ContextMenu = {
  Item: ContextMenuItemButton,
} 