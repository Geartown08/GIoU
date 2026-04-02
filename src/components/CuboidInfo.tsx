import React from "react";
import { styles } from "./CuboidPanel";
import type {CuboidPanelProps} from "../types/Cuboid";

export function CuboidInfo({cuboids, selectedId}: CuboidPanelProps){
	const selectedCuboids = cuboids.filter(i => i.id === selectedId);
	const {left, ...newPanel} = styles.panel;
	return (
		<div style={{...newPanel, right: 16}}>
		{selectedCuboids.map(c => 
			<h3 style={styles.title}>Cuboid: {c.id}</h3>

		)}
		</div>
	);
	

};
