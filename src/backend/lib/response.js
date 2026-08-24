'use strict';

function sendError(res, status, message, details) {
    const payload = { error: message };
    if (details) payload.details = details;
    return res.status(status).json(payload);
}

function sendTasksList(res, tasks, pagination) {
    return res.json({
        tasks: Array.isArray(tasks) ? tasks : [],
        pagination: pagination ?? null
    });
}

module.exports = { sendError, sendTasksList };
