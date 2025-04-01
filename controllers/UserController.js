const express = require('express');
const router = express.Router();
const userService = require('../services/UserService');
const logger = require('../modules/logger'); // Import your centralized logger
const { verifyToken } = require('../modules/helper'); 
const bcrypt = require('bcrypt');


router.post('/add/password', async (req, res, next) => {
    try {
        // Extract user email and password from the request body
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            logger.error('Validation error in /add/password:', {
                message: 'Email or password is missing.',
                body: req.body
            });
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Call the service to add the password
        const result = await userService.setUserPassword({ email, password });
        return res.json(result);
    } catch (error) {
        logger.error('Error in /add/password controller:', {
            message: error.message,
            stack: error.stack,
            headers: req.headers,
            body: req.body,
            ipAddress: req.ip || req.connection.remoteAddress
        });
        next(error); // Pass error to the centralized error handler
    }
});

// Route to fetch users based on role access
router.get('/all/cro', async (req, res, next) => {
    try {
        // Extract and verify the authentication token
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing.' });
        }

        const verifiedToken = await verifyToken(token);
        const userType = verifiedToken?.data?.userType?.toLowerCase();
        const requestingUserId = verifiedToken?.data?.user; // Get the userId of the requester

        if (!userType || !requestingUserId) {
            return res.status(403).json({ message: 'Access denied. Invalid role or userId missing.' });
        }

        let result;
        if (userType === 'superadmin') {
            // If SuperAdmin, fetch all users (CRO, SalesAgent, Others) except the requester
            result = await userService.getAllUsersExceptRole(null, requestingUserId);
        } else {
            // If not SuperAdmin, fetch all users except SuperAdmin and the requester
            result = await userService.getAllUsersExceptRole('superadmin', requestingUserId);
        }

        return res.status(result.status).json(result);
    } catch (error) {
        logger.error('Error in UserController - /all/cro:', {
            message: error.message,
            stack: error.stack,
            ipAddress: req.ip || req.connection.remoteAddress
        });
        next(error);
    }
});

// Route to delete a user and all associated data
router.delete('/delete/:userId', async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing.' });
        }

        // Verify the token and extract the user's role
        const verifiedToken = await verifyToken(token);

        // Only SuperAdmin can delete users
        if (verifiedToken?.data?.userType?.toLowerCase() !== 'superadmin') {
            logger.error('Unauthorized user deletion attempt', {
                userId: verifiedToken?.data?.userId,
                userType: verifiedToken?.data?.userType,
                ipAddress: req.ip || req.connection.remoteAddress,
            });
            return res.status(403).json({ message: 'Access denied. Only SuperAdmin can delete users.' });
        }

        // Extract the userId to delete from the request params
        const { userId } = req.params;

        // Call the service to delete the user and all associated data
        const result = await userService.deleteUserAndAssociatedData(userId);

        return res.status(result.status).json(result);
    } catch (error) {
        logger.error('Error in UserController - DELETE /delete/:userId:', {
            message: error.message,
            stack: error.stack,
            ipAddress: req.ip || req.connection.remoteAddress,
        });
        next(error);
    }
});


// Route to fetch leads assigned to a user
router.get('/my-leads', async (req, res, next) => {
    try {
        // Extract and verify the authentication token
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing.' });
        }

        const verifiedToken = await verifyToken(token);
        const userId = verifiedToken?.data?.user;

        if (!userId) {
            return res.status(401).json({ message: 'Invalid token. Unable to retrieve user ID.' });
        }

        // Fetch leads assigned to the user
        const result = await userService.getUserLeads(userId);

        return res.status(result.status).json(result);
    } catch (error) {
        logger.error('Error in UserController - /my-leads:', {
            message: error.message,
            stack: error.stack,
            ipAddress: req.ip || req.connection.remoteAddress
        });
        next(error);
    }
});

// Route to update user profile (flexible and optional fields)
router.put('/update-profile', async (req, res, next) => {
    let verifiedToken; // Declare verifiedToken outside the try block

    try {
        // Extract the token from the Authorization header
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing.' });
        }

        // Verify the token and extract the user ID
        verifiedToken = await verifyToken(token); // Assign value to verifiedToken
        const userId = verifiedToken?.data?.user;

        if (!userId) {
            return res.status(401).json({ message: 'Invalid token. Unable to retrieve user ID.' });
        }

        // Extract updated fields from the request body
        const { username, email, currentPassword, newPassword } = req.body;

        // Fetch the user from the database
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Prepare the update object
        const updateFields = {};

        // Update username if provided
        if (username) {
            updateFields.username = username;
        }

        // Update email if provided
        if (email) {
            updateFields.email = email;
        }

        // Update password if provided
        if (newPassword) {
            // Validate current password if changing password
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to update password.' });
            }

            // Compare the current password with the stored hashed password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateFields.password = hashedPassword;
        }

        // If no fields are provided for update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        // Update the user in the database
        const updatedUser = await userService.updateUserProfile(userId, updateFields);

        // Log the successful update
        logger.info('User profile updated successfully', {
            userId,
            updatedFields: Object.keys(updateFields),
        });

        // Return the updated user data (excluding the password)
        const userResponse = { ...updatedUser._doc };
        delete userResponse.password;

        return res.status(200).json({
            status: 200,
            message: 'Profile updated successfully.',
            data: userResponse,
        });
    } catch (error) {
        logger.error('Error updating user profile:', {
            message: error.message,
            stack: error.stack,
            userId: verifiedToken?.data?.user, // Now verifiedToken is accessible
        });
        next(error);
    }
});

// Route to fetch user profile
router.get('/profile', async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing.' });
        }

        // Verify the token and extract the user ID
        const verifiedToken = await verifyToken(token);
        const userId = verifiedToken?.data?.user;

        if (!userId) {
            return res.status(401).json({ message: 'Invalid token. Unable to retrieve user ID.' });
        }

        // Fetch the user's profile data
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Return the user's profile data (excluding sensitive fields like password)
        const userProfile = {
            username: user.username,
            email: user.email,
            gender: user.gender,
            phonenumber: user.phonenumber,
            Address: user.Address,
            role: user.RoleId?.name || 'No Role Assigned', // Include role name if available
        };

        return res.status(200).json({
            status: 200,
            message: 'User profile fetched successfully.',
            data: userProfile,
        });
    } catch (error) {
        logger.error('Error fetching user profile:', {
            message: error.message,
            stack: error.stack,
            userId: verifiedToken?.data?.user,
        });
        next(error);
    }
});

// Route to update user's password by email
router.put('/update/password', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        logger.error('Validation error in update password route:', {
          message: 'Email or password is missing.',
          body: req.body
        });
        return res.status(400).json({ message: 'Email and password are required.' });
      }
      
      const result = await userService.updateUserPasswordByEmail({ email, password });
      return res.status(result.status).json(result);
    } catch (error) {
      logger.error('Error in update password route:', {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      next(error);
    }
  });

module.exports = router;
