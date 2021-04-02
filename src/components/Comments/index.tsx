import { useEffect } from "react";

export function Comments(): JSX.Element {
  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");

    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin","anonymous");
    script.setAttribute("async", Boolean(true).toString());
    script.setAttribute("repo", "wellingtonngallo/spacetraveling-comments");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute( "theme", "github-dark");
    anchor.appendChild(script);
  }, []);

  return (
    <div id="inject-comments-for-uterances"></div>
  )
}
