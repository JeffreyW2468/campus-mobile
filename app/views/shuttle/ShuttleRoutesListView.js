import React from 'react';
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	ListView,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

const resultsDataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const ShuttleRoutesListView = ({ shuttle_routes, gotoStopsList }) => (
	<ListView
		dataSource={resultsDataSource.cloneWithRows(shuttle_routes)}
		renderRow={
			(row, sectionID, rowID) =>
				<RouteItem
					data={row}
					index={rowID}
					gotoStopsList={gotoStopsList}
				/>
		}
	/>
);

const RouteItem = ({ data, index, gotoStopsList }) => (
	<TouchableOpacity
		onPress={() => gotoStopsList(data.stops)}
		style={styles.list_row}
	>
		<Text style={{ flex: 4 }}>
			{data.name.trim()}
		</Text>
		{
			(false) ? (
				<Icon
					style={{ flex: 1 }}
					name="check"
					size={20}
				/>
			) : (null)
		}
	</TouchableOpacity>
);

const styles = StyleSheet.create({
	list_row: { alignItems: 'center', flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEE', overflow: 'hidden',  },
});

export default ShuttleRoutesListView;
