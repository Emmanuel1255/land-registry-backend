// src/utils/formatters.js
const formatters = {

    formatFileSize: (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
      },

      formatDuration: (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
    
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
      },
    
      formatPropertyStatus: (status) => {
        const statusMap = {
          [constants.PROPERTY_STATUS.PENDING]: {
            label: 'Pending',
            color: 'yellow',
          },
          [constants.PROPERTY_STATUS.REGISTERED]: {
            label: 'Registered',
            color: 'green',
          },
          [constants.PROPERTY_STATUS.REJECTED]: {
            label: 'Rejected',
            color: 'red',
          },
        };
    
        return statusMap[status] || { label: status, color: 'gray' };
      },


    formatCurrency: (amount, currency = 'SLE') => {
      return new Intl.NumberFormat('en-SL', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    },
  
    formatDate: (date) => {
      return new Date(date).toLocaleDateString('en-SL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  
    formatPhoneNumber: (phoneNumber) => {
      // Implement phone number formatting for Sierra Leone
      return phoneNumber;
    },
  
    formatAddress: (address) => {
      return `${address.street}, ${address.city}, ${address.state}`;
    },
  
    slugify: (text) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    },
  formatPropertyType: (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  },

  // Helper for generating sequential reference numbers
  generateReferenceNumber: (prefix, sequence) => {
    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  },

  // Format error messages for API responses
  formatErrorResponse: (error) => {
    if (error.isJoi) {
      return {
        status: 'error',
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      };
    }

    return {
      status: 'error',
      message: error.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
  },

  // Format success response
  formatSuccessResponse: (data, message) => {
    return {
      status: 'success',
      message,
      data,
    };
  },
};

module.exports = formatters;