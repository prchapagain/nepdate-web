import { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronDown } from 'lucide-react';
import { PUJA_DATA } from '../../data/static/pageContents';
import type { ContentBlock } from '../../types/types';

export const PujaSection = ({ onBack }: { onBack: () => void }) => {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	//  Scroll Handling
	useEffect(() => {
		if (expandedId) {
			const element = document.getElementById(`puja-${expandedId}`);

			if (element) {
				setTimeout(() => {
					element.scrollIntoView({
						behavior: 'smooth',
						block: 'start'
					});
				}, 100);
			}
		}
	}, [expandedId]);
	//

	// Renderer for Puja Content
	const renderContent = (blocks: ContentBlock[]) => {
		return blocks.map((block, index) => {
			switch (block.type) {
				case 'heading':
					return (
						<h4 key={index} className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2 first:mt-0">
							{block.text}
						</h4>
					);
				case 'paragraph':
					return (
						<p
							key={index}
							className={`text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-3 ${block.className || ''}`}
							dangerouslySetInnerHTML={{ __html: block.text }}
						/>
					);
				case 'image':
					return (
						<figure key={index} className="my-4">
							<img
								src={block.src}
								alt={block.alt}
								className="w-full h-48 object-cover rounded-xl shadow-sm"
							/>
							{block.caption && (
								<figcaption className="text-center text-xs text-gray-500 mt-2 italic">
									{block.caption}
								</figcaption>
							)}
						</figure>
					);
				case 'list':
					return (
						<ul key={index} className="list-disc pl-5 mb-3 space-y-1 text-gray-600 dark:text-gray-300">
							{block.items.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					);
				default:
					return null;
			}
		});
	};

	return (
		<div className="flex flex-col h-full bg-slate-50 dark:bg-gray-900 animate-in slide-in-from-right duration-200">
			{/* App Bar */}
			<div className="bg-white dark:bg-gray-800 px-4 h-14 flex items-center gap-4 sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-700">
				<button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700 transition-colors">
					<ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
				</button>
				<h1 className="font-semibold text-xl text-gray-800 dark:text-gray-100">पूजा विधि</h1>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-3">
				{PUJA_DATA.map((item) => (
					<div
						key={item.id}
						id={`puja-${item.id}`}
						className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 scroll-mt-20 transition-all duration-300"
					>
						<button
							className="w-full flex items-center justify-between p-4 text-left active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
							onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
						>
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
									<Flame size={20} />
								</div>
								<h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{item.title}</h3>
							</div>
							<ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedId === item.id ? 'rotate-180' : ''}`} />
						</button>
						{expandedId === item.id && (
							<div className="px-4 pb-5 pl-[4.5rem]">
								{renderContent(item.content)}
							</div>
						)}
					</div>
				))}
				<p className="text-center text-xs text-gray-400 mt-6 pb-2">
					थप सामग्री आगामी अपडेटमा थपिनेछन्।
				</p>
			</div>
		</div>
	);
};