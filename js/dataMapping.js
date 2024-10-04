/**
 * Maps over the dataset, applying the provided operation to each element.
 * Adds or updates the 'timestamp' field to indicate when the mapping was performed.
 *
 * @param {Array} dataset - The original dataset to map over. 
 * @param {Function} operation - A callback function that defines the operation to perform on each element.
 * @returns {Array} A new array with the mapped data and updated timestamps.
 */
export function mapDataset(dataset, mapFunction) {
    return dataset.map(item => {
        const updatedItem = mapFunction(item);
        return {
            ...item,
            ...updatedItem,
            timestamp: new Date().toISOString()
        };
    });
}

