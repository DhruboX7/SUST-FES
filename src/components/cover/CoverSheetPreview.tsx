import React from 'react';
import { CoverFormData } from '../../types/cover';
import {
  getCoverDesignPalette,
  formatCoverDate,
  formatDepartmentHeading,
} from '../../utils/coverRenderer';
import { SUST_LOGO_URL } from '../SustLogo';

interface CoverSheetPreviewProps {
  data: CoverFormData;
  id?: string;
}

const CornerBracketsSvg: React.FC<{ color: string; inset?: number; arm?: number }> = ({
  color,
  inset = 26,
  arm = 32,
}) => (
  <svg
    aria-hidden="true"
    width="794"
    height="1123"
    viewBox="0 0 794 1123"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    }}
  >
    {/* Top-Left */}
    <path
      d={`M ${inset} ${inset + arm} L ${inset} ${inset} L ${inset + arm} ${inset}`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
    />
    {/* Top-Right */}
    <path
      d={`M ${794 - inset - arm} ${inset} L ${794 - inset} ${inset} L ${794 - inset} ${inset + arm}`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
    />
    {/* Bottom-Left */}
    <path
      d={`M ${inset} ${1123 - inset - arm} L ${inset} ${1123 - inset} L ${inset + arm} ${1123 - inset}`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
    />
    {/* Bottom-Right */}
    <path
      d={`M ${794 - inset - arm} ${1123 - inset} L ${794 - inset} ${1123 - inset} L ${794 - inset} ${1123 - inset - arm}`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
    />
  </svg>
);

const BotanicalTwigSvg: React.FC<{ color: string }> = ({ color }) => (
  <svg
    aria-hidden="true"
    width="112"
    height="26"
    viewBox="-56 -13 112 26"
    style={{ margin: '0 auto', display: 'block' }}
  >
    <line x1="-48" y1="0" x2="48" y2="0" stroke={color} strokeWidth="1.6" />
    <path d="M 0 -10 Q 10 0 0 10 Q -10 0 0 -10 Z" fill={color} />
    <ellipse
      cx="-24"
      cy="-5"
      rx="8"
      ry="3.4"
      transform="rotate(-25 -24 -5)"
      fill="none"
      stroke={color}
      strokeWidth="1.4"
    />
    <ellipse
      cx="-24"
      cy="5"
      rx="8"
      ry="3.4"
      transform="rotate(25 -24 5)"
      fill="none"
      stroke={color}
      strokeWidth="1.4"
    />
    <ellipse
      cx="24"
      cy="-5"
      rx="8"
      ry="3.4"
      transform="rotate(25 24 -5)"
      fill="none"
      stroke={color}
      strokeWidth="1.4"
    />
    <ellipse
      cx="24"
      cy="5"
      rx="8"
      ry="3.4"
      transform="rotate(-25 24 5)"
      fill="none"
      stroke={color}
      strokeWidth="1.4"
    />
  </svg>
);

export const CoverSheetPreview: React.FC<CoverSheetPreviewProps> = ({ data, id }) => {
  const palette = getCoverDesignPalette(data.designId, data.monochromePrint);

  const isBanner = data.designId === 'emerald-banner';
  const isRibbon = data.designId === 'botanical-ribbon';
  const isBotanical = data.designId === 'forestry-botanical';
  const isHerbarium = data.designId === 'royal-herbarium';
  const isNavyGold = data.designId === 'navy-gold-formal';
  const isSwiss = data.designId === 'swiss-minimal';
  const isMinimal = data.designId === 'minimal-studio';

  const serifFont = '"Fraunces", "Cormorant Garamond", "Noto Serif Bengali", Georgia, serif';
  const sansFont = '"Manrope", "Noto Sans Bengali", system-ui, sans-serif';

  const universityLine =
    data.universityName.trim() || 'Shahjalal University of Science and Technology, Sylhet';
  const deptLine = formatDepartmentHeading(data.department);
  const teacherDeptLine = formatDepartmentHeading(data.teacherDepartment || data.department);
  const teacherUniLine = data.teacherUniversity.trim() || universityLine;
  const showSecondTeacher = Boolean(data.hasSecondTeacher);
  const teacher2DeptLine = formatDepartmentHeading(
    data.teacher2Department || data.teacherDepartment || data.department
  );
  const teacher2UniLine = data.teacher2University?.trim() || teacherUniLine;

  const detailRows: Array<{ label: string; value: string }> =
    data.coverType === 'Lab Report'
      ? [
          { label: 'Experiment No.', value: data.experimentNo || '01' },
          { label: 'Experiment Name', value: data.experimentName || '—' },
          { label: 'Date of Experiment', value: formatCoverDate(data.experimentDate) },
          { label: 'Date of Submission', value: formatCoverDate(data.reportSubmissionDate) },
        ]
      : [
          {
            label: data.coverType === 'Assignment' ? 'Assignment Title' : `${data.coverType} Title`,
            value: data.topicTitle || '—',
          },
          {
            label: data.coverType === 'Assignment' ? 'Date of Assignment' : 'Date of Topic',
            value: formatCoverDate(data.topicDate),
          },
          { label: 'Date of Submission', value: formatCoverDate(data.submissionDate) },
        ];

  const studentRows: Array<{ label: string; value: string; bold?: boolean }> = [
    { label: 'Name', value: data.studentName || 'Student Name', bold: true },
    { label: 'Reg. No.', value: data.registrationNo || '2025xxxxxx' },
  ];
  if (data.group.trim()) studentRows.push({ label: 'Group', value: data.group.trim() });
  if (data.semester.trim()) studentRows.push({ label: 'Semester', value: data.semester.trim() });
  if (data.session.trim()) studentRows.push({ label: 'Session', value: data.session.trim() });

  return (
    <div
      id={id}
      style={{
        width: '794px',
        height: '1123px',
        backgroundColor: palette.paper,
        color: palette.ink,
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily: sansFont,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Frame & Chrome Overlays per Design */}
      {data.designId === 'classic-academic' && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: '36px',
              border: `1.6px solid ${palette.primary}`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '43px',
              border: `0.7px solid ${palette.accent}`,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {(isBotanical || isHerbarium || isNavyGold || isSwiss) && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: '34px',
              border: `${isSwiss ? '2.5px' : '2px'} solid ${palette.primary}`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '42px',
              border: `1px solid ${palette.accent}`,
              pointerEvents: 'none',
            }}
          />
          {isBotanical && <CornerBracketsSvg color={palette.accent} inset={26} arm={34} />}
          {(isHerbarium || isNavyGold) && (
            <CornerBracketsSvg color={palette.primary} inset={28} arm={28} />
          )}
        </>
      )}

      {isMinimal && (
        <div
          style={{
            position: 'absolute',
            inset: '46px',
            border: `1px solid ${palette.accent}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {isRibbon && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '44px',
              backgroundColor: palette.primary,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '44px',
              bottom: 0,
              width: '8px',
              backgroundColor: palette.accent,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '36px',
              left: '72px',
              right: '36px',
              bottom: '36px',
              border: `0.8px solid ${palette.plaqueBorder}`,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Header Zone (Banner or Framed) */}
      {isBanner ? (
        <div
          style={{
            backgroundColor: palette.headerBg || palette.primary,
            borderBottom: `5px solid ${palette.accent}`,
            height: '252px',
            padding: '34px 72px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {data.showLogo && (
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '9999px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                padding: '7px',
              }}
            >
              <img
                src={SUST_LOGO_URL}
                alt="SUST Crest"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
          <div
            style={{
              fontFamily: serifFont,
              fontSize: '22px',
              fontWeight: 700,
              lineHeight: 1.26,
              color: palette.headerText || '#FFFFFF',
            }}
          >
            {universityLine}
          </div>
          <div
            style={{
              fontFamily: sansFont,
              fontSize: '15px',
              fontWeight: 600,
              marginTop: '6px',
              color: data.monochromePrint ? '#E5E7EB' : '#BBC4A6',
            }}
          >
            {deptLine}
          </div>
        </div>
      ) : (
        <div
          style={{
            paddingTop: '72px',
            paddingLeft: isRibbon ? '96px' : '74px',
            paddingRight: isRibbon ? '58px' : '74px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {data.showLogo && (
            <div
              style={{
                width: '86px',
                height: '86px',
                margin: '0 auto 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={SUST_LOGO_URL}
                alt="SUST Official Crest"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: data.monochromePrint ? 'grayscale(100%) contrast(1.15)' : undefined,
                }}
              />
            </div>
          )}

          <div
            style={{
              fontFamily: serifFont,
              fontSize: '22px',
              fontWeight: 700,
              lineHeight: 1.28,
              color: palette.primary,
            }}
          >
            {universityLine}
          </div>
          <div
            style={{
              fontFamily: sansFont,
              fontSize: '15.5px',
              fontWeight: 600,
              marginTop: '6px',
              color: palette.secondary,
            }}
          >
            {deptLine}
          </div>

          <div style={{ marginTop: '18px' }}>
            {isBotanical || isHerbarium ? (
              <BotanicalTwigSvg color={palette.accent} />
            ) : (
              <div
                style={{
                  width: '220px',
                  height: '1.2px',
                  backgroundColor: palette.accent,
                  margin: '0 auto',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Inner Body Border for Banner Layout */}
      {isBanner && (
        <div
          style={{
            position: 'absolute',
            top: '276px',
            left: '34px',
            right: '34px',
            bottom: '34px',
            border: `1px solid ${palette.plaqueBorder}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingTop: isBanner ? '36px' : '28px',
          paddingBottom: '50px',
          paddingLeft: isRibbon ? '96px' : '74px',
          paddingRight: isRibbon ? '58px' : '74px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Document Headline + Course Plaque + Topic Metadata */}
        <div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: serifFont,
                fontSize: '29px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: palette.primary,
              }}
            >
              {data.coverType.toUpperCase()}
            </div>
            <div
              style={{
                width: '128px',
                height: '2px',
                backgroundColor: palette.accent,
                margin: '10px auto 0',
              }}
            />
          </div>

          {/* Course Code & Title Plaque */}
          <div
            style={{
              margin: '28px 18px 0',
              padding: '20px 26px',
              backgroundColor: palette.plaqueBg,
              border: `${isSwiss ? '2px' : '1.5px'} solid ${palette.plaqueBorder}`,
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: sansFont,
                fontSize: '13.5px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: palette.secondary,
                textTransform: 'uppercase',
              }}
            >
              COURSE CODE : {(data.courseCode || 'FES 0821xxxx').toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: serifFont,
                fontSize: '18.5px',
                fontWeight: 600,
                lineHeight: 1.38,
                color: palette.ink,
                marginTop: '8px',
              }}
            >
              {data.courseTitle || 'Course Title'}
            </div>
          </div>

          {/* Topic / Experiment Metadata */}
          <div
            style={{
              margin: '32px 22px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {detailRows.map((row) => (
              <div
                key={row.label}
                style={{
                  fontSize: '15.5px',
                  lineHeight: 1.5,
                  color: palette.ink,
                }}
              >
                <span
                  style={{
                    fontFamily: sansFont,
                    fontSize: '14.5px',
                    fontWeight: 600,
                    color: palette.secondary,
                  }}
                >
                  {row.label} :{' '}
                </span>
                <span style={{ fontFamily: serifFont, fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Submission Columns (Submitted To | Submitted By) */}
        <div style={{ margin: '0 18px' }}>
          <div
            style={{
              borderTop: `1.2px solid ${palette.plaqueBorder}`,
              paddingTop: '18px',
              display: 'grid',
              gridTemplateColumns: '1fr 1.5px 1fr',
              gap: '24px',
              alignItems: 'stretch',
            }}
          >
            {/* Submitted To */}
            <div style={{ paddingRight: '4px' }}>
              <div
                style={{
                  fontFamily: sansFont,
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: palette.primary,
                }}
              >
                SUBMITTED TO
              </div>
              <div
                style={{
                  width: '68px',
                  height: '1.6px',
                  backgroundColor: palette.accent,
                  marginTop: '6px',
                  marginBottom: showSecondTeacher ? '12px' : '16px',
                }}
              />
              <div
                style={{
                  fontFamily: serifFont,
                  fontSize: showSecondTeacher ? '15px' : '16.5px',
                  fontWeight: 700,
                  lineHeight: 1.32,
                  color: palette.ink,
                  marginBottom: showSecondTeacher ? '4px' : '6px',
                }}
              >
                {data.teacherName || 'Course Instructor'}
              </div>
              {data.teacherDesignation && (
                <div
                  style={{
                    fontSize: showSecondTeacher ? '13px' : '14.5px',
                    lineHeight: showSecondTeacher ? 1.38 : 1.48,
                    color: palette.mutedInk,
                  }}
                >
                  {data.teacherDesignation}
                </div>
              )}
              <div
                style={{
                  fontSize: showSecondTeacher ? '13px' : '14.5px',
                  lineHeight: showSecondTeacher ? 1.38 : 1.48,
                  color: palette.mutedInk,
                }}
              >
                {teacherDeptLine}
              </div>
              <div
                style={{
                  fontSize: showSecondTeacher ? '13px' : '14.5px',
                  lineHeight: showSecondTeacher ? 1.38 : 1.48,
                  color: palette.mutedInk,
                }}
              >
                {teacherUniLine}
              </div>

              {showSecondTeacher && (
                <div
                  style={{
                    marginTop: '11px',
                    paddingTop: '10px',
                    borderTop: `0.8px solid ${palette.plaqueBorder}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: serifFont,
                      fontSize: '15px',
                      fontWeight: 700,
                      lineHeight: 1.32,
                      color: palette.ink,
                      marginBottom: '4px',
                    }}
                  >
                    {data.teacher2Name?.trim() || '2nd Course Instructor'}
                  </div>
                  {data.teacher2Designation?.trim() && (
                    <div
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.38,
                        color: palette.mutedInk,
                      }}
                    >
                      {data.teacher2Designation.trim()}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.38,
                      color: palette.mutedInk,
                    }}
                  >
                    {teacher2DeptLine}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.38,
                      color: palette.mutedInk,
                    }}
                  >
                    {teacher2UniLine}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div
              style={{
                backgroundColor: palette.accent,
                width: '1.5px',
                minHeight: '225px',
              }}
            />

            {/* Submitted By */}
            <div style={{ paddingLeft: '4px' }}>
              <div
                style={{
                  fontFamily: sansFont,
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: palette.primary,
                }}
              >
                SUBMITTED BY
              </div>
              <div
                style={{
                  width: '68px',
                  height: '1.6px',
                  backgroundColor: palette.accent,
                  marginTop: '6px',
                  marginBottom: '16px',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {studentRows.map((item) => (
                  <div key={item.label} style={{ fontSize: '14px', lineHeight: 1.45 }}>
                    <span
                      style={{
                        fontFamily: sansFont,
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: palette.secondary,
                      }}
                    >
                      {item.label} :{' '}
                    </span>
                    <span
                      style={{
                        fontFamily: item.bold ? serifFont : sansFont,
                        fontSize: item.bold ? '15px' : '14px',
                        fontWeight: item.bold ? 700 : 500,
                        color: palette.ink,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
