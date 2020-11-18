import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UserProfileClients from './UserProfileClients';
const UserProfile = ({ auth }) => {
    // useEffect(() => {
    //     //getProfileById(match.params.id);
    // }, [getProfileById, match.params.id]);
    let uid = auth.user._id;
    const fullName = auth.user.firstName + ' ' + auth.user.lastName;
    return (
        <Fragment>
            <Fragment>
                <h2 className='large text-primary'>
                    <i className='far fa fa-cogs'></i> Your profile
                </h2>
                <p>Welcome {auth.user && fullName}</p>
                <p>_id: {auth.user._id}</p>
                <p>First Name: {auth.user.firstName}</p>
                <p>Last Name: {auth.user.lastName}</p>
                <p>Email: {auth.user.email}</p>
                <p>Phone: {auth.user.phone}</p>
                <p>Default Client: {auth.user.defaultClient}</p>
                <p>Default Role: {auth.user.defaultClientRole}</p>
                <p>Default Status: {auth.user.defaultClientStatus}</p>
                <hr />
                <p>Active Client: {auth.user.activeClient}</p>
                <p>Active Role: {auth.user.activeRole}</p>
                <p>Active Status: {auth.user.activeStatus}</p>
            </Fragment>
            {/* <UserProfileClients uid={uid} /> */}
        </Fragment>
    );
};

UserProfile.propTypes = {
    auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, {})(UserProfile);
