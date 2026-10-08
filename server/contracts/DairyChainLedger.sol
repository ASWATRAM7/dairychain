// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DairyChainLedger {

    struct DataLog {
        bytes32 dataHash;
        string deviceId;
        uint256 temperature;   // °C × 100 (e.g., 2850 = 28.50°C)
        uint256 humidity;      // % × 100 (e.g., 6520 = 65.20%)
        uint256 timestamp;
        address anchorer;
    }

    DataLog[] public logs;
    mapping(bytes32 => uint256) public hashToIndex; // dataHash → log index + 1 (0 means not found)

    event LogAnchored(
        bytes32 indexed dataHash,
        uint256 indexed index,
        string deviceId,
        uint256 temperature,
        uint256 humidity,
        uint256 timestamp,
        address anchorer
    );

    function anchorLog(
        bytes32 _dataHash,
        string memory _deviceId,
        uint256 _temperature,
        uint256 _humidity
    ) external returns (uint256) {
        require(_dataHash != bytes32(0), "Invalid hash");

        uint256 index = logs.length;
        logs.push(DataLog({
            dataHash: _dataHash,
            deviceId: _deviceId,
            temperature: _temperature,
            humidity: _humidity,
            timestamp: block.timestamp,
            anchorer: msg.sender
        }));

        hashToIndex[_dataHash] = index + 1;

        emit LogAnchored(_dataHash, index, _deviceId, _temperature, _humidity, block.timestamp, msg.sender);
        return index;
    }

    function getLog(uint256 _index) external view returns (DataLog memory) {
        require(_index < logs.length, "Index out of bounds");
        return logs[_index];
    }

    function getLogByHash(bytes32 _dataHash) external view returns (DataLog memory) {
        uint256 idx = hashToIndex[_dataHash];
        require(idx != 0, "Hash not found");
        return logs[idx - 1];
    }

    function verifyHash(bytes32 _dataHash) external view returns (bool) {
        return hashToIndex[_dataHash] != 0;
    }

    function getTotalLogs() external view returns (uint256) {
        return logs.length;
    }
}
