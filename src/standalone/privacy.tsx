import { createRoot } from "react-dom/client";
import PrivacyPage from "../pages/PrivacyPage";
import '../index.css'

const container = document.getElementById("privacy-root");
if (container) {
	const root = createRoot(container);
	root.render(<PrivacyPage/>);
}
