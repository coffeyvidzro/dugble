import type {
    LegalDocumentMeta,
    LegalSectionData,
} from "../shared/legal-types";

export const meta: LegalDocumentMeta = {
    eyebrow: "Legal",
    title: "Terms of Service",
    effectiveDate: "August 12, 2026",
    lastUpdated: "August 12, 2026",
    intro: "These Terms govern your access to and use of Dugble's API, dashboard, and related services. By creating a team or using our API, you agree to these Terms on behalf of yourself and, if applicable, the organization you represent.",
    summaryPoints: [
        "You're responsible for getting proper consent before messaging anyone through Dugble.",
        "You own your data; we process it only to deliver the service.",
        "Don't use Dugble for spam, illegal content, or unregistered bulk messaging.",
        "We can suspend accounts that violate carrier or legal requirements - usually with notice, immediately for serious abuse.",
        "Either of us can terminate; you can export your data beforehand.",
    ],
};

export const sections: LegalSectionData[] = [
    {
        id: "acceptance",
        title: "Acceptance of these Terms",
        blocks: [
            {
                type: "paragraph",
                text: "These Terms of Service (“Terms”) form a binding agreement between you (“Customer,” “you”) and Dugble (“Dugble,” “we,” “us”) governing your use of the Dugble API, dashboard, webhooks, and related services (together, the “Service”). By creating a team, generating an API key, or otherwise accessing the Service, you agree to these Terms.",
            },
            {
                type: "paragraph",
                text: "If you're accepting these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind that entity, in which case “you” refers to that entity.",
            },
            {
                type: "paragraph",
                text: "If you do not agree to these Terms, do not access or use the Service.",
            },
        ],
    },
    {
        id: "definitions",
        title: "Definitions",
        blocks: [
            {
                type: "definitionList",
                items: [
                    {
                        term: "Account",
                        definition:
                            "The Dugble account associated with your email address, used to sign in and manage one or more Teams.",
                    },
                    {
                        term: "Team",
                        definition:
                            "A container for API keys, sent messages, webhooks, and team members, scoped to a single project or environment.",
                    },
                    {
                        term: "API Key",
                        definition:
                            "A credential used to authenticate requests to the Dugble API on behalf of a Team.",
                    },
                    {
                        term: "Message",
                        definition:
                            "Any SMS, email, or other communication submitted through the Service for delivery to a Recipient.",
                    },
                    {
                        term: "Recipient",
                        definition:
                            "The end user or third party who receives a Message sent through your use of the Service.",
                    },
                    {
                        term: "Content",
                        definition:
                            "The text, data, and metadata contained in a Message, including any personal data about a Recipient that you submit.",
                    },
                    {
                        term: "Sub-processor",
                        definition:
                            "A third party engaged by Dugble to process data in order to provide the Service, such as a carrier, cloud provider, or delivery partner.",
                    },
                    {
                        term: "Data Protection Legislation",
                        definition:
                            "Ghana's Data Protection Act, 2012 (Act 843), and other data protection laws that apply based on where you or your Recipients are located, including elsewhere in Africa.",
                    },
                ],
            },
        ],
    },
    {
        id: "eligibility",
        title: "Eligibility and Account Registration",
        blocks: [
            {
                type: "paragraph",
                text: "You must be at least 18 years old and able to form a binding contract to use the Service. You're responsible for the accuracy of the information you provide when creating an Account and for keeping it up to date.",
            },
            {
                type: "paragraph",
                text: "You're responsible for maintaining the confidentiality of your Account credentials and API Keys, and for all activity that occurs under them. Notify us immediately at hello@dugble.com if you suspect unauthorized use.",
            },
        ],
    },
    {
        id: "the-service",
        title: "The Service",
        blocks: [
            {
                type: "paragraph",
                text: "Dugble provides an API and dashboard for sending SMS and email messages, receiving delivery events via webhooks, and reviewing logs of message activity. Features, rate limits, and supported channels may vary by plan and may change as the Service evolves.",
            },
            {
                type: "paragraph",
                text: "We may modify, suspend, or discontinue any part of the Service, including individual API endpoints or features, at any time. We'll provide reasonable notice before changes that materially reduce the functionality of the Service, except where not practical, such as for security reasons.",
            },
        ],
    },
    {
        id: "acceptable-use",
        title: "Acceptable Use",
        blocks: [
            {
                type: "paragraph",
                text: "You're responsible for the Content you send and for how you use the Service. You agree not to use the Service to:",
            },
            {
                type: "list",
                items: [
                    "Send Messages to a Recipient without the legally required consent or opt-in for that channel and jurisdiction;",
                    "Send unsolicited bulk messages, spam, or messages that violate applicable anti-spam or telemarketing laws;",
                    "Transmit content that is unlawful, fraudulent, deceptive, defamatory, or infringes on someone else's rights;",
                    "Send content related to illegal goods or services, or that facilitates phishing, malware distribution, or account takeover;",
                    "Impersonate any person or entity, or misrepresent your affiliation with one;",
                    "Circumvent rate limits, sender registration requirements, or carrier filtering;",
                    "Interfere with or disrupt the integrity or performance of the Service or its underlying infrastructure;",
                    "Reverse engineer, resell, or provide the Service to third parties as your own competing product, except as expressly permitted under your plan.",
                ],
            },
            {
                type: "paragraph",
                text: "We may investigate suspected violations and take corrective action, including message throttling, Content review, or Account suspension, as described below.",
            },
        ],
    },
    {
        id: "messaging-compliance",
        title: "Messaging and Telecom Compliance",
        blocks: [
            {
                type: "paragraph",
                text: "A2P (application-to-person) messaging is subject to carrier requirements and telecom regulations that vary by country and channel. You're solely responsible for:",
            },
            {
                type: "list",
                items: [
                    "Obtaining and documenting valid consent from each Recipient before sending them Messages;",
                    "Honoring opt-out requests (such as “STOP” replies) promptly and not re-messaging a Recipient who has opted out;",
                    "Registering your sender ID or short code with Ghana's National Communications Authority (NCA) and the relevant network operators before sending promotional or commercial Messages, and completing equivalent registration in other African markets where you send Messages;",
                    "Complying with the NCA's Unsolicited Electronic Communications Code of Conduct, including sending promotional Messages only between 8:00 a.m. and 7:00 p.m., not on Sundays, and no more than three promotional Messages to the same Recipient within a 30-day period;",
                    "Complying with Data Protection Legislation, including obtaining prior written consent before using the Service for direct marketing to individuals in Ghana, and honoring a Recipient's objection to processing of their personal data under the Data Protection Act, 2012 (Act 843).",
                ],
            },
            {
                type: "paragraph",
                text: "Carriers may filter, delay, or block Messages that fail to meet registration or content requirements, and Dugble is not responsible for delivery failures caused by carrier-side filtering resulting from your Content or sending practices.",
            },
            {
                type: "paragraph",
                text: "We may require you to complete sender registration before enabling certain sending volumes or channels, and may suspend sending on unregistered or non-compliant campaigns.",
            },
            {
                type: "paragraph",
                text: "Where the Data Protection Act, 2012 (Act 843) applies to your use of the Service, you're responsible for your own registration as a data controller with Ghana's Data Protection Commission where required, independent of Dugble's own registration as a data controller and processor.",
            },
        ],
    },
    {
        id: "fees-billing",
        title: "Fees and Billing",
        blocks: [
            {
                type: "paragraph",
                text: "Fees for the Service are based on your selected plan and usage, as described on our Pricing page or in an order form. Usage-based fees are calculated based on Messages sent and other billable events recorded in our systems, which are conclusive absent manifest error.",
            },
            {
                type: "paragraph",
                text: "Fees are billed in arrears unless otherwise agreed, are exclusive of applicable taxes, and are non-refundable except as required by law or expressly stated in these Terms. We may suspend the Service for accounts with a failed or overdue payment, after providing notice.",
            },
            {
                type: "paragraph",
                text: "We may change our pricing with at least 30 days' notice; continued use of the Service after the change takes effect constitutes acceptance of the new pricing.",
            },
        ],
    },
    {
        id: "suspension-termination",
        title: "Suspension and Termination",
        blocks: [
            {
                type: "paragraph",
                text: "We may suspend or restrict your access to the Service immediately, without prior notice, if we reasonably believe your use presents a security risk, violates the Acceptable Use section above, results in carrier complaints, or is otherwise unlawful.",
            },
            {
                type: "paragraph",
                text: "Either party may terminate these Terms for convenience with 30 days' written notice. We may also terminate immediately for a material breach that remains uncured 15 days after notice, or for non-payment.",
            },
            {
                type: "paragraph",
                text: "Upon termination, your right to access the Service ends, though provisions that by their nature should survive - including payment obligations, confidentiality, disclaimers, and limitations of liability - will survive. You may export your logs and Message history for 30 days following termination by contacting hello@dugble.com.",
            },
        ],
    },
    {
        id: "data-content",
        title: "Your Data and Content",
        blocks: [
            {
                type: "paragraph",
                text: "As between you and Dugble, you retain all rights to the Content you submit through the Service, including Message text and Recipient information. You grant Dugble a limited license to access, process, and transmit that Content solely to provide, maintain, and improve the Service.",
            },
            {
                type: "paragraph",
                text: "You represent that you have all necessary rights and consents to submit Recipient information and Content to the Service, and that doing so does not violate any applicable law or third-party right.",
            },
            {
                type: "paragraph",
                text: "Our handling of personal data submitted through the Service is described in our Privacy Policy.",
            },
        ],
    },
    {
        id: "intellectual-property",
        title: "Intellectual Property",
        blocks: [
            {
                type: "paragraph",
                text: "Dugble retains all right, title, and interest in and to the Service, including our software, APIs, documentation, and branding. Except for the limited rights expressly granted in these Terms, no other rights are granted to you.",
            },
            {
                type: "paragraph",
                text: "You may not use Dugble's name, logos, or trademarks without our prior written consent, except as permitted by our brand guidelines.",
            },
        ],
    },
    {
        id: "confidentiality",
        title: "Confidentiality",
        blocks: [
            {
                type: "paragraph",
                text: "Each party may have access to non-public information of the other party in connection with these Terms (“Confidential Information”). Each party agrees to use the other's Confidential Information only to perform its obligations under these Terms, and to protect it with the same degree of care it uses for its own confidential information, but no less than reasonable care.",
            },
            {
                type: "paragraph",
                text: "Confidential Information does not include information that is or becomes public through no fault of the receiving party, was already known to the receiving party, or is independently developed.",
            },
        ],
    },
    {
        id: "warranties-disclaimers",
        title: "Warranties and Disclaimers",
        blocks: [
            {
                type: "paragraph",
                text: "Each party represents that it has the legal authority to enter into these Terms.",
            },
            {
                type: "paragraph",
                text: "Except as expressly stated in these Terms, THE SERVICE IS PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that Message delivery will be uninterrupted, error-free, or accepted by every carrier or recipient network.",
            },
        ],
    },
    {
        id: "limitation-of-liability",
        title: "Limitation of Liability",
        blocks: [
            {
                type: "paragraph",
                text: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY WILL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO THESE TERMS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
            },
            {
                type: "paragraph",
                text: "EACH PARTY'S TOTAL LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS WILL NOT EXCEED THE FEES PAID OR PAYABLE BY YOU TO DUGBLE IN THE THREE MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.",
            },
            {
                type: "paragraph",
                text: "These limitations do not apply to a party's indemnification obligations, confidentiality breaches, or either party's fraud or willful misconduct, and do not limit liability to the extent it cannot be limited under applicable law.",
            },
        ],
    },
    {
        id: "indemnification",
        title: "Indemnification",
        blocks: [
            {
                type: "paragraph",
                text: "You agree to defend, indemnify, and hold harmless Dugble from and against any claims, damages, and expenses (including reasonable attorneys' fees) arising from your Content, your use of the Service in violation of these Terms, or your violation of applicable law, including consent or telecom compliance requirements.",
            },
        ],
    },
    {
        id: "governing-law",
        title: "Governing Law and Dispute Resolution",
        blocks: [
            {
                type: "paragraph",
                text: "These Terms are governed by the laws of the Republic of Ghana, without regard to conflict-of-law principles. Any dispute arising out of these Terms will be resolved in the courts located in Accra, Ghana, and each party consents to personal jurisdiction there.",
            },
            {
                type: "paragraph",
                text: "Before filing a claim, both parties agree to attempt to resolve the dispute informally by contacting the other party in writing.",
            },
        ],
    },
    {
        id: "changes",
        title: "Changes to these Terms",
        blocks: [
            {
                type: "paragraph",
                text: "We may update these Terms from time to time. If we make material changes, we'll provide notice by posting the updated Terms on this page and updating the “Last updated” date, and, where required, by additional notice such as email. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.",
            },
        ],
    },
    {
        id: "miscellaneous",
        title: "Miscellaneous",
        blocks: [
            {
                type: "list",
                items: [
                    "Assignment: Neither party may assign these Terms without the other's consent, except in connection with a merger, acquisition, or sale of substantially all assets.",
                    "Force majeure: Neither party is liable for delays caused by events beyond its reasonable control.",
                    "Entire agreement: These Terms, together with any order form and our Privacy Policy, constitute the entire agreement between the parties regarding the Service.",
                    "Severability: If any provision of these Terms is found unenforceable, the remaining provisions remain in full effect.",
                    "No waiver: A party's failure to enforce a provision is not a waiver of its right to do so later.",
                ],
            },
        ],
    },
    {
        id: "contact",
        title: "Contact",
        blocks: [
            {
                type: "paragraph",
                text: "Questions about these Terms can be sent to hello@dugble.com or through our contact page.",
            },
        ],
    },
];
