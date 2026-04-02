import { styles } from "./CuboidPanel";
import type {CuboidPanelProps} from "../types/Cuboid";

export function CuboidInfo({cuboids, selectedId}: Pick<CuboidPanelProps, "cuboids" | "selectedId" >){
	const selectedCuboids = cuboids.filter(i => i.id === selectedId);

	return selectedId === null ? null : (
		<div style={{...newPanel, right: 16}}>
		<h3 style={styles.title}>Shape Info</h3>
		{selectedCuboids.map(c => 
			<div>
				<h4>Cuboid: {c.id}</h4>
				<p>Width: {c.width}</p>
				<p>Height: {c.height}</p>
				<p>Depth: {c.depth}</p>
				<p>Colour: {c.color}</p>
				<p>Position: {c.position.join(", ")}</p>
				<p>Rotation: {c.rotation.join(", ")}</p>
				<p>Scale: {c.scale.join(", ")}</p>
			</div>
		)}
		</div>
	);
	

};

const {left, ...newPanel} = styles.panel;
