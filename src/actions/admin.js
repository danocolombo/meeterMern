import axios from 'axios';
import { setAlert } from './alert';
import { randomBytes, createCipheriv } from 'crypto';
import {
    SET_CLIENT_USERS,
    // SET_CLIENT,
    ADMIN_ERROR,
    SET_DEFAULT_GROUPS,
    ADD_DEFAULT_GROUP,
    SET_MTG_CONFIGS,
    REMOVE_CLIENT_USER,
    TOGGLE_CONFIG,
} from './types';

// GET CLIENT INFO

export const getClientInfo = (cid) => async (dispatch) => {
    try {
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@');
        console.log('actions/admin :: getClientInfo (' + cid + ')');
    } catch (err) {
        console.log('actions/admin.js getClientInfo ADMIN_ERROR');
        dispatch({
            type: ADMIN_ERROR,
        });
    }
};
export const getClientUsers = (client) => async (dispatch) => {
    console.log('getClientUsers(' + client + ')');
    console.log('/api/client/userstatus/' + client);
    try {
        const res = await axios.get(`/api/client/userstatus/${client}`);
        dispatch({
            type: SET_CLIENT_USERS,
            payload: res.data,
        });
    } catch (err) {
        console.log('actions/admin.js getClientUsers ADMIN_ERROR');
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};

export const getDefGroups = (cid) => async (dispatch) => {
    //this loads all the default groups for cid
    //into meeter.defaultGroups
    console.log('getDefGroups(' + cid + ')');
    console.log('/api/client/defaultgroups/' + cid);
    try {
        const res = await axios.get(`/api/client/defaultgroups/${cid}`);
        if (res) {
            dispatch({
                type: SET_DEFAULT_GROUPS,
                payload: res.data,
            });
        } else {
            console.log('NO DEFAULT GROUPS RETURNED');
        }
    } catch (err) {
        console.log('actions/admin.js getDefGroups ADMIN_ERROR');
        dispatch({
            type: ADMIN_ERROR,
            // payload: {
            //     msg: err.response.statusText ? err.response.statusText : '',
            //     status: err.response.status,
            // },
        });
    }
};
export const getMtgConfigs = (cid) => async (dispatch) => {
    //this loads all the default groups for cid
    //into meeter.defaultGroups
    if (!cid) return;
    console.log('getMtgConfigs(' + cid + ')');
    console.log('/api/client/meetingConfigs/' + cid);
    try {
        const res = await axios.get(`/api/client/meetingConfigs/${cid}`);
        if (res) {
            dispatch({
                type: SET_MTG_CONFIGS,
                payload: res.data,
            });
        } else {
            console.log('NO CLIENT MEETING CONFIGS');
        }
    } catch (err) {
        console.log('actions/admin.js getMtgConfigs ADMIN_ERROR');
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText ? err.response.statusText : '',
                status: err.response.status,
            },
        });
    }
};
export const updateDefaultGroup = (revised) => async (dispatch) => {
    console.log('getting the work done.');
    console.log('_id:' + revised._id);
    console.log('client: ' + revised.cid);
    console.log('gender: ' + revised.gender);
    console.log('title: ' + revised.title);
    console.log('location: ' + revised.location);
    console.log('facilitator: ' + revised.gender);
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const res = await axios.put(
            `/api/client/defaultgroup`,
            revised,
            config
        );
        // now get the default groups and reload Redux
        const ress = await axios.get(
            `/api/client/defaultgroups/${revised.cid}`
        );
        dispatch({
            type: 'SET_DEFAULT_GROUPS',
            payload: ress.data,
        });
        dispatch(setAlert('Default Group Updated.', 'success'));
    } catch (err) {
        console.log('actions/admin.js updateDefaultGroup ADMIN_ERROR');
        dispatch(setAlert('Default Group Update Failed.', 'danger'));
    }
};
// export const deleteDefaultGroup = (groupId) => async (dispatch) => {
//     // need to remove the default group from the client doc using
//     // the client id (cid) and the groups indicator (gid);
//     console.log("trying to delete");
//     dispatch({
//         type: 'REMOVE_DEFAULT_GROUP',
//         payload: groupId,
//     });
    
// };
export const grantUserRegistration = (cid, id, role, email) => async (
    dispatch
) => {
    // this is called from Admin/DisplaySecurity when a user with permission has
    // decided to add a perosn to their client.  We first add them to the client
    // list of users, then add them to people.
    //---------------------------------
    // update client entry first
    //----------------------------------
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    let res = null;
    try {
        //-----------------------------
        // first update the client users
        //------------------------------
        let updateClientUser = {};
        updateClientUser._id = id;
        updateClientUser.cid = cid;
        updateClientUser.email = email;
        updateClientUser.role = role;
        updateClientUser.status = 'approved';

        res = await axios.put('/api/client/user', updateClientUser, config);

        //------------------------------------------
        // now check if the user is already on team
        //------------------------------------------
        let potentialPeep = {};
        potentialPeep.cid = cid;
        potentialPeep.email = email;
        console.log('before validateemail call ');
        // let res = null;
        try {
            res = await axios.post(
                '/api/people/validateemail',
                potentialPeep,
                config
            );
            //------------------------------------------------
            // if the person is in the system it will not get
            // an error, so we fall through. If they are not
            // in the people collection, it will get 404 and
            // fall into the catch below to add them.
            //------------------------------------------------
            console.log('this one is on the team, not adding');
        } catch (error) {
            //no info for user, we can add them now

            console.log('not on team, add them.');
            // need to get user info
            const userRef = await axios.get(`/api/users/identify/${id}`);
            let personInfo = {};

            personInfo.tenantId = 'people-' + cid;
            personInfo.name = userRef.data.name;
            personInfo.email = userRef.data.email;
            personInfo.defaultClient = userRef.data.defaultClient;

            // then pass the user to the people table
            const peopleRef = await axios.post(
                '/api/people',
                personInfo,
                config
            );
        }
    } catch (err) {
        console.log('actions/admin.js grantUserRegistration ADMIN_ERROR #1');
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
    try {
        const resz = await axios.get(`/api/client/userstatus/${cid}`);
        dispatch({
            type: SET_CLIENT_USERS,
            payload: resz.data,
        });
    } catch (err) {
        console.log('actions/admin.js grantUserRegistration ADMIN_ERROR #2');
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};
export const rejectUserRegistration = (cid, id, email) => async (dispatch) => {
    // this is called from Admin/DisplaySecurity when a user with permission has
    // decided to reject a registration request.  We remove the user from
    // client collection document for the client.
    //=============================
    try {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.log('actions/admin :: rejectUserRegistration');
        //delete user from client document
        await axios.delete(`/api/client/user/${cid}/${id}`);
        console.log('deleted user from client doc');
        //delete user from user document
        console.log('email: ' + email);
        console.log('need to delete them from people...');
        console.log('/api/people/byemail/' + cid + '/' + email);
        await axios.delete(`/api/people/byemail/${cid}/${email}`);
        // await axios.delete(`/api/users/email/${email}`);
        console.log('deleted user from users doc');
        //get remaining client users
        const res = await axios.get(`/api/client/userstatus/${cid}`);
        console.log('got remaining users');

        dispatch({
            type: SET_CLIENT_USERS,
            payload: res.data,
        });
        dispatch(setAlert('User Removed', 'success'));
    } catch (err) {
        console.log('actions/admin.js rejectUserRegistration ADMIN_ERROR');
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};
// export const removeDefGroup = (cid, gid) => async (dispatch) => {
//     //this removes the user id from client users
//     // in database and removes from meeter.clientUsers
//     //-----
//     // uid is the reference in the users array in the client document
//     // need email to delate the user from user document.
//     try {
//         console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
//         console.log('copied from another function that is called');
//         console.log('actions/admin :: removeDefGroup ' + cid + gid);
//         await axios.delete(`/api/client/defaultgroup/${cid}/${gid}`);
//         const res = await axios.get(`/api/client/defaultgroups/${cid}`);
//         if (res) {
//             dispatch({
//                 type: 'SET_DEFAULT_GROUPS',
//                 payload: res.data,
//             });
//         } else {
//             console.log('NO DEFAULT GROUPS RETURNED');
//         }

//         dispatch(setAlert('Default Group Removed', 'success'));
//     } catch (err) {
//         console.log('actions/admin.js removeDefGroup ADMIN_ERROR');
//         dispatch({
//             type: ADMIN_ERROR,
//             payload: {
//                 msg: err.response.statusText,
//                 status: err.response.status,
//             },
//         });
//     }
// };
export const deleteDefGroup = (groupId, clientInfo) => async (dispatch) => {
    //this removes the defGroup id from client
    //reference in database and updates meeter.defaultGroups
    dispatch({
        type: 'REMOVE_DEFAULT_GROUP',
        payload: groupId,
    });
    // now remove the group form the client object to send to AWS API
    let newClient = {
        ...clientInfo, 
        defaultGroups: clientInfo.defaultGroups.filter((group) => group.groupId != groupId)};
    // now wrap the newClient with Item
    const config = {
        headers: {
            'Access-Control-Allow-Headers':
                'Content-Type, x-auth-token, Access-Control-Allow-Headers',
            'Content-Type': 'application/json',
        },
    };
    let obj = {
        operation: 'updateClient',
        payload: {
            Item: newClient,
        },
    };
    let body = JSON.stringify(obj);
    // console.log('sending to /clients api\n\n' + body);
    let api2use = process.env.REACT_APP_MEETER_API + '/clients';
    let res = await axios.post(api2use, body, config);
    
    // console.log('\n\nRESPONSE FROM AWS API')
    // const util = require('util');
    // console.log('res:  \n' + util.inspect(res, { showHidden: false, depth: null }));

};
export const deleteClientUser = (cid, uid) => async (dispatch) => {
    //this removes the user id from client users
    // in database and removes from meeter.clientUsers
    try {
        await axios.delete(`/api/client/user/${cid}/${uid}`);

        dispatch({
            type: REMOVE_CLIENT_USER,
            payload: uid,
        });

        dispatch(setAlert('User Removed', 'success'));
    } catch (err) {
        console.log('actions/admin.js deleteClientUser ADMIN_ERROR');
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};
export const updateMeetingConfigs = (
    formData,
    history,
    cid,
    edit = false
) => async (dispatch) => {
    // console.table(formData);

    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const res = await axios.put(
        `/api/client/updateconfigs/${cid}`,
        formData,
        config
    );
    dispatch(setAlert('Would have saved the values.', 'success'));
};
export const approveClientUser = (id) => async (dispatch) => {
    //this updates the status of the user (id) in client
    //users in database to approved and updates
    //meeter.clientUsers status
};
export const suspendClientUser = (id) => async (dispatch) => {
    //this updates the status of the user (id) in client
    //users in database to suspended and updates
    //meeter.clientUsers status
};
export const toggleConfig = (config, value, cid) => async (dispatch) => {
    // this gets the client and configuration value
    // if the value exists, we remove it, if it does
    // not exist, we add it.
    let theChange = {};
    theChange.cid = cid;
    theChange.config = config;
    theChange.value = value;
    // console.table(theChange);
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const res = await axios.post(
            '/api/client/toggleconfig',
            theChange,
            config
        );

        dispatch({
            type: TOGGLE_CONFIG,
            payload: res,
        });

        dispatch(setAlert('System Configuration Updated', 'success'));
    } catch (err) {
        console.log('actions/admin.js deleteClientUser ADMIN_ERROR');
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
    
};
function getUniqueId() {
    //this generates a unique ID based on this specific time
    // Difining algorithm
    const algorithm = 'aes-256-cbc';
    // Defining key
    const key = randomBytes(32);
    // Defining iv
    const iv = randomBytes(16);
    let cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    //get the current time...
    let n = Date.now();
    let encrypted = cipher.update(n.toString());
    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

export const addDefaultGroup = (request, clientId) => async dispatch => {
    dispatch(setAlert("addDefaultGroup clicked", 'success'));
    // let groupId = randomBytes(16).toString('base64');
    let groupId = getUniqueId();
    //add default group to client entry in AWS dynamodb
    let newGroup = request.formData;
    // newGroup.clientId = clientId;
    newGroup.groupId = groupId;

    //send the new default group to AWS API
    try {
        const config = {
            headers: {
                'Access-Control-Allow-Headers':
                    'Content-Type, x-auth-token, Access-Control-Allow-Headers',
                'Content-Type': 'application/json',
            },
        };
        let obj = {
            operation: 'addNewDefaultGroup',
            payload: newGroup,
        };
        
        let body = JSON.stringify(obj);

        let api2use = process.env.REACT_APP_MEETER_API + '/clients';
        let res = await axios.post(api2use, body, config);
        // console.log('res:' + JSON.stringify(res.data));
        if (res.status === 200) {
            //     dispatch({
            //         type: SET_CLIENT,
            //         payload: res.data,
            //     });
            // }
            dispatch({
                type: ADD_DEFAULT_GROUP,
                payload: newGroup,
            });
            dispatch(setAlert("client updated", 'success'));
            
        }
    } catch (err) {
        dispatch({
            type: ADMIN_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
    
};