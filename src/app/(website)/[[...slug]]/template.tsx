import { ReactNode } from "react"






export default function Template({
  children
}: {
  children: ReactNode;
}) {
  console.log("Template Layout Is Active")
  return <>{children}</>
}
