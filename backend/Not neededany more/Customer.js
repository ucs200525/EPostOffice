const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    // ...existing customer fields...
    feedbacks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback'
    }]
});

// ...existing schema configuration...
