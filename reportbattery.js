 
// https://github.com/hybridgroup/node-bebop/blob/master/test/bebop.js



var bebop = require("../"),
expect = require("chai").expect,

 describe("events", function() {
      it("should report battery", function() {
        var size = 12,
            packetBuf = new Buffer(size),
            type = bebop.constants.ARNETWORKAL_FRAME_TYPE_DATA,
            id = bebop.constants.BD_NET_DC_EVENT_ID,
            seq = 10,
            commandProject = bebop.constants.ARCOMMANDS_ID_PROJECT_COMMON,
            commandClass = bebop.constants.ARCOMMANDS_ID_COMMON_CLASS_COMMONSTATE,
            commandId = bebop.constants.ARCOMMANDS_ID_COMMON_COMMONSTATE_CMD_BATTERYSTATECHANGED,
            level = 90;

        packetBuf.writeUInt8(type, 0);
        packetBuf.writeUInt8(id, 1);
        packetBuf.writeUInt8(seq, 2);
        packetBuf.writeUInt32LE(size, 3);
        packetBuf.writeUInt8(commandProject, 7);
        packetBuf.writeUInt8(commandClass, 8);
        packetBuf.writeUInt16LE(commandId, 9);
        packetBuf.writeUInt8(level, 11);

        drone._packetReceiver(packetBuf);

        expect(drone.navData.battery).to.equal(level);
      });