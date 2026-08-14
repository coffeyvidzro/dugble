import type {
    LegalDocumentMeta,
    LegalSectionData,
} from "../shared/legal-types";

export const meta: LegalDocumentMeta = {
    eyebrow: "Legal",
    title: "Privacy Policy",
    effectiveDate: "August 12, 2026",
    lastUpdated: "August 12, 2026",
    intro: "This Privacy Policy explains how Dugble collects, uses, and protects information when you use our website, dashboard, and API - and how we handle data you submit on behalf of your own recipients.",
    summaryPoints: [
        "For your account and billing data, Dugble is the data controller.",
        "For message content and recipient data you send through the API, Dugble acts as a data processor on your behalf.",
        "We don't sell personal data, and we only share it with sub-processors who help us run the Service.",
        "You can access, export, or delete your data - and your recipients can opt out of receiving messages at any time.",
        "We're established in Ghana and process data in accordance with the Data Protection Act, 2012 (Act 843), including registration with the Data Protection Commission.",
    ],
};

export const sections: LegalSectionData[] = [
    {
        id: "scope",
        title: "Scope of this Policy",
        blocks: [
            {
                type: "paragraph",
                text: "This Privacy Policy describes how Dugble (“Dugble,” “we,” “us”) handles personal data in connection with our marketing website, dashboard, API, and related services (the “Service”). It applies to Customers who create a Dugble Account, and, where relevant, to the Recipients of Messages sent through the Service.",
            },
            {
                type: "paragraph",
                text: "This Policy doesn't cover the practices of third parties we don't control, including any website you link to from your own communications sent through Dugble.",
            },
        ],
    },
    {
        id: "controller-processor",
        title: "Our Role: Controller and Processor",
        blocks: [
            {
                type: "paragraph",
                text: "Dugble acts in two different capacities depending on the data involved, a distinction that matters under Ghana's Data Protection Act, 2012 (Act 843) and similar data protection laws elsewhere in Africa:",
            },
            {
                type: "subheading",
                text: "As a controller",
            },
            {
                type: "paragraph",
                text: "For Account, Team, and billing information - such as your name, email, and payment details - Dugble determines the purposes and means of processing and acts as the data controller.",
            },
            {
                type: "subheading",
                text: "As a processor",
            },
            {
                type: "paragraph",
                text: "For content and recipient data you submit through the API for delivery - such as phone numbers, email addresses, and message text - Dugble acts as a data processor, processing that data only on your instructions and for the purpose of delivering your messages. You act as the controller of that data and are responsible for having a valid legal basis to collect and share it with us.",
            },
        ],
    },
    {
        id: "information-we-collect",
        title: "Information We Collect",
        blocks: [
            {
                type: "subheading",
                text: "Account and team data",
            },
            {
                type: "paragraph",
                text: "Name, email address, company name, and authentication data you provide when creating an Account, plus Team configuration such as members and API key metadata.",
            },
            {
                type: "subheading",
                text: "Message content and recipient data",
            },
            {
                type: "paragraph",
                text: "The content and recipient information (such as phone numbers or email addresses) that you submit through the API to be delivered, processed solely to send and track your messages.",
            },
            {
                type: "subheading",
                text: "Special categories of data",
            },
            {
                type: "paragraph",
                text: "Some laws, including Ghana's Data Protection Act, 2012 (Act 843), place additional restrictions on “special personal data” such as health, sexual life, ethnic origin, religious belief, political opinion, or criminal record information. Please avoid including special personal data in Message content sent through the Service unless you have an appropriate legal basis and adequate safeguards in place; contact us first if your use case requires sending this type of data so we can discuss what's needed.",
            },
            {
                type: "subheading",
                text: "Usage and log data",
            },
            {
                type: "paragraph",
                text: "Information about how the Service is used, including API request metadata, delivery status, timestamps, IP addresses, and error logs, used to operate, secure, and improve the Service.",
            },
            {
                type: "subheading",
                text: "Payment information",
            },
            {
                type: "paragraph",
                text: "Billing details are collected and processed by our payment processor; Dugble does not store full payment card numbers on its own systems.",
            },
            {
                type: "subheading",
                text: "Cookies and similar technologies",
            },
            {
                type: "paragraph",
                text: "Our marketing website uses cookies for essential functionality and, where enabled, analytics, as described in the Cookies section below.",
            },
        ],
    },
    {
        id: "how-we-use-information",
        title: "How We Use Information",
        blocks: [
            {
                type: "list",
                items: [
                    "To provide, operate, and maintain the Service, including sending Messages and delivering webhook events;",
                    "To authenticate requests and secure Accounts and Teams;",
                    "To monitor, debug, and improve the reliability and performance of the Service;",
                    "To communicate with you about your Account, including service notices and, where you've opted in, product updates;",
                    "To detect, investigate, and prevent fraud, abuse, and violations of our Terms of Service;",
                    "To comply with legal obligations and enforce our agreements.",
                ],
            },
            {
                type: "paragraph",
                text: "We do not use Content or Recipient data submitted through the API to train machine learning models or for our own marketing purposes.",
            },
            {
                type: "paragraph",
                text: "Ghana's Data Protection Act, 2012 (Act 843) requires a data subject's prior written consent before their personal data is used for direct marketing. Customers are responsible for obtaining that consent - and any equivalent consent required under other African data protection laws - before using the Service to send direct marketing messages.",
            },
        ],
    },
    {
        id: "legal-bases",
        title: "Legal Bases for Processing",
        blocks: [
            {
                type: "paragraph",
                text: "Under Ghana's Data Protection Act, 2012 (Act 843), we only process personal data with your prior consent, unless the processing is necessary for a contract to which you're a party, authorized or required by law, needed to protect your legitimate interest, necessary for the proper performance of a statutory duty, or necessary to pursue a legitimate interest of Dugble or a third party to whom the data is supplied.",
            },
            {
                type: "paragraph",
                text: "For Content and Recipient data processed on your behalf, you're responsible for identifying the appropriate legal basis for the underlying communication, such as consent from your Recipients.",
            },
            {
                type: "paragraph",
                text: "Where a different African country's data protection law applies to your Recipients, similar principles typically apply, and you remain responsible for identifying the appropriate basis for processing under that law as well.",
            },
        ],
    },
    {
        id: "ghana-data-protection-act",
        title: "Compliance with Ghana's Data Protection Act",
        blocks: [
            {
                type: "paragraph",
                text: "Dugble is established in the Republic of Ghana and processes personal data in accordance with the Data Protection Act, 2012 (Act 843) (the “Act”), in addition to the other data protection laws described elsewhere in this Policy that may apply to you or your Recipients based on your location.",
            },
            {
                type: "paragraph",
                text: "As a data controller under the Act, Dugble registers with Ghana's Data Protection Commission and applies the data protection principles set out in the Act: accountability, lawfulness of processing, specification of purpose, compatibility of further processing with the purpose of collection, quality of information, openness, data security safeguards, and data subject participation.",
            },
            {
                type: "paragraph",
                text: "Where you or your Recipients are located in Ghana, or personal data otherwise originates from Ghana, the Act's requirements around consent, purpose limitation, retention, and data subject rights apply alongside the practices described throughout this Policy.",
            },
            {
                type: "paragraph",
                text: "Many other African countries have adopted broadly similar data protection frameworks. Where those laws apply to you or your Recipients, we aim to honor equivalent obligations alongside our compliance with Act 843.",
            },
        ],
    },
    {
        id: "sub-processors",
        title: "Sub-processors and Data Sharing",
        blocks: [
            {
                type: "paragraph",
                text: "We share data with a limited set of sub-processors who help us deliver the Service, including cloud infrastructure providers, SMS and email carriers or delivery partners, and our payment processor. Sub-processors are bound by contractual obligations to protect data and to use it only to provide services to Dugble.",
            },
            {
                type: "paragraph",
                text: "We may also disclose information where required by law, to protect the rights, property, or safety of Dugble, our customers, or others, or in connection with a merger, acquisition, or sale of assets, subject to this Policy continuing to apply to previously collected data.",
            },
            {
                type: "paragraph",
                text: "We do not sell personal data. The sale of personal data is prohibited under Ghana's Data Protection Act, 2012 (Act 843).",
            },
        ],
    },
    {
        id: "data-retention",
        title: "Data Retention",
        blocks: [
            {
                type: "paragraph",
                text: "We retain Account and Team data for as long as your Account is active, and for a limited period afterward to comply with legal, tax, or accounting obligations.",
            },
            {
                type: "paragraph",
                text: "Message content and delivery logs are retained according to the retention window associated with your plan, after which they're automatically deleted or anonymized. You can request earlier deletion of specific records by contacting us.",
            },
            {
                type: "paragraph",
                text: "Where you delete a Team, associated Content and Recipient data are deleted within a reasonable period, except where retention is required by law.",
            },
        ],
    },
    {
        id: "international-transfers",
        title: "International Data Transfers",
        blocks: [
            {
                type: "paragraph",
                text: "Dugble and our sub-processors may process data in countries other than where you or your Recipients are located. Where personal data is transferred outside Ghana, we take reasonable steps to ensure it continues to receive an appropriate level of protection, consistent with the Data Protection Act, 2012 (Act 843).",
            },
            {
                type: "paragraph",
                text: "Where personal data originating from a foreign jurisdiction, including other African countries, is sent to Ghana for processing, we take into account the data protection legislation of that jurisdiction, consistent with the Data Protection Act, 2012 (Act 843).",
            },
        ],
    },
    {
        id: "security",
        title: "Security",
        blocks: [
            {
                type: "paragraph",
                text: "We use technical and organizational measures designed to protect data processed through the Service, including encryption of data in transit, scoped and revocable API tokens, and signed webhook payloads so you can verify the authenticity of delivery events.",
            },
            {
                type: "paragraph",
                text: "No method of transmission or storage is completely secure. If we become aware of a security incident affecting your data, we'll notify both the affected data subject and Ghana's Data Protection Commission as soon as reasonably practicable, in accordance with the Data Protection Act, 2012 (Act 843).",
            },
            {
                type: "paragraph",
                text: "More detail on our security practices is available on our Security page.",
            },
        ],
    },
    {
        id: "your-rights",
        title: "Your Rights",
        blocks: [
            {
                type: "paragraph",
                text: "Under Ghana's Data Protection Act, 2012 (Act 843), you have the right to access personal data we hold about you (which we aim to fulfil within the Act's 40-day statutory period), request correction, blocking, erasure, or destruction of inaccurate data, object to processing that causes unwarranted damage or distress, object to your data being used for direct marketing, and request that a decision significantly affecting you not be based solely on automated processing. Customers should manage or request changes to Account data through the dashboard or by contacting hello@dugble.com.",
            },
            {
                type: "paragraph",
                text: "Where Dugble acts as a processor on your behalf - for example, for Recipient data you've submitted - we'll help fulfill Recipient requests, but ask that Recipients direct requests to you as the controller in the first instance, since you hold the underlying relationship and context.",
            },
            {
                type: "paragraph",
                text: "If you're not satisfied with our response to a rights request, you may lodge a complaint with Ghana's Data Protection Commission, or the equivalent authority in your country if a different African data protection law applies to you.",
            },
        ],
    },
    {
        id: "recipient-choices",
        title: "Recipient Choices",
        blocks: [
            {
                type: "paragraph",
                text: "Recipients of Messages sent through the Service can typically opt out of future Messages using the method provided in the Message, such as replying “STOP” to an SMS or using an unsubscribe link in an email. Customers are required to honor these opt-outs promptly, as described in our Terms of Service.",
            },
            {
                type: "paragraph",
                text: "Recipients with questions about a specific Message should contact the sender directly, as Dugble does not control the content or purpose of Messages sent by our Customers.",
            },
        ],
    },
    {
        id: "childrens-privacy",
        title: "Children's Privacy",
        blocks: [
            {
                type: "paragraph",
                text: "The Service is not directed to individuals under the age of 18, and we do not knowingly collect personal data from children through our Account registration. If you believe a child has provided us with personal data, contact us so we can take appropriate action.",
            },
        ],
    },
    {
        id: "cookies",
        title: "Cookies",
        blocks: [
            {
                type: "paragraph",
                text: "Our marketing website uses essential cookies required for the site to function, and, where enabled, analytics cookies to help us understand site usage. You can control cookies through your browser settings; disabling essential cookies may affect site functionality.",
            },
        ],
    },
    {
        id: "changes-to-policy",
        title: "Changes to this Policy",
        blocks: [
            {
                type: "paragraph",
                text: "We may update this Privacy Policy from time to time. Material changes will be reflected by an updated “Last updated” date, and, where required, communicated through additional notice such as email or an in-product message.",
            },
        ],
    },
    {
        id: "contact",
        title: "Contact",
        blocks: [
            {
                type: "paragraph",
                text: "Questions about this Privacy Policy or requests regarding your personal data can be sent to hello@dugble.com or through our contact page.",
            },
        ],
    },
];
