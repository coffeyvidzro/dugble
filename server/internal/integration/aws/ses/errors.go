package ses

import "errors"

var ErrUnsupportedAttachmentPath = errors.New("attachment paths are not supported by the SES integration")
