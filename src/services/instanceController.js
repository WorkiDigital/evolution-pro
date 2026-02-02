import http from "../http-common";

/**
 * Hybrid fetchAll: tries v2 endpoint first, then v1 fallback
 */
const fetchAll = async () => {
  try {
    return await http.get("/instance").then((r) => r.data);
  } catch (e) {
    return await http.get("/instance/fetchInstances").then((r) => r.data);
  }
};

const create = async (data) => {
  return await http
    .post("/instance/create", data)
    .then((r) => r.data)
    .catch((error) => {
      throw error.response?.data || error.response || error;
    });
}

const connect = async (instanceName) => {
  return await http
    .get("/instance/connect/:instance", {
      params: {
        instance: instanceName
      }
    })
    .then((r) => r.data)
    .catch((error) => {
      throw error.response?.data || error.response || error;
    });
}

const getConnectionState = async (instanceName) => {
  return await http
    .get("/instance/connectionState/:instance", {
      params: {
        instance: instanceName
      }
    })
    .then((r) => r.data)
    .catch((error) => {
      throw error.response?.data || error.response || error;
    });
}

const logout = async (instanceName) => {
  return await http
    .delete("/instance/logout/:instance", {
      params: {
        instance: instanceName
      }
    })
    .then((r) => r.data)
    .catch((error) => {
      throw error.response?.data || error.response || error;
    });
}

const restart = async (instanceName) => {
  return await http
    .put("/instance/restart/:instance", {}, {
      params: {
        instance: instanceName
      }
    })
    .then((r) => r.data)
    .catch((error) => {
      throw error.response?.data || error.response || error;
    });
}

const deleteInstance = async (instanceName) => {
  return await http
    .delete("/instance/delete/:instance", {
      params: {
        instance: instanceName
      }
    })
    .then((r) => r.data)
    .catch((error) => {
      throw error.response?.data || error.response || error;
    });
}

/**
 * Creates an instance and immediately returns connection data (QR)
 * Ideal for lead/client onboarding
 */
const createAndConnect = async (instanceName, options = {}) => {
  try {
    // 1. Create the instance
    const createData = {
      instanceName,
      token: options.token || undefined,
      qrcode: true,
      ...options
    };
    const newInstance = await create(createData);

    // 2. Immediate connect request to get QR/Connection status
    const connection = await connect(instanceName);

    return {
      success: true,
      instance: newInstance,
      connection: connection
    };
  } catch (error) {
    console.error('Error in createAndConnect:', error);
    throw error;
  }
}

import settings from "./instanceSettingsController.js";
import group from "./instanceGroupController.js";
import chat from "./instanceChatController.js";
import profile from "./instanceProfileController.js";

export default {
  fetchAll,
  create,
  connect,
  getConnectionState,
  createAndConnect,
  logout,
  restart,
  delete: deleteInstance,
  ...settings,
  group,
  chat,
  profile,
};
